"""CLI para inspecionar e reparar replies automaticas em comentarios do Instagram.

Uso:
    python manage_comments.py --list --post-id 51
    python manage_comments.py --show 132
    python manage_comments.py --repair 132
    python manage_comments.py --repair 132 --message "Texto revisado"
    python manage_comments.py --delete-reply 132
"""

import argparse
import asyncio
import re
import unicodedata

from auto_responder import AutoResponder, MAX_COMMENT_LENGTH
from database import ConversationLog, ScheduledPost, get_session, init_db
from publisher import InstagramPublisher


def _normalize_lookup_text(text: str | None) -> str:
    normalized = unicodedata.normalize("NFKD", (text or "").strip().lower())
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized


def _truncate_preview(text: str | None, limit: int = 100) -> str:
    clean = re.sub(r"\s+", " ", (text or "")).strip()
    if len(clean) <= limit:
        return clean or "-"
    return clean[: limit - 3].rstrip() + "..."


def _load_comment_log(log_id: int) -> ConversationLog | None:
    session = get_session()
    log = (
        session.query(ConversationLog)
        .filter(ConversationLog.id == log_id, ConversationLog.message_type == "comment")
        .first()
    )
    if log:
        session.expunge(log)
    session.close()
    return log


def _resolve_media_id_from_post(post_id: int) -> str | None:
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()
    media_id = post.ig_media_id if post else None
    session.close()
    return media_id


def list_comment_logs(post_id: int | None = None, media_id: str | None = None, limit: int = 20):
    if post_id:
        media_id = _resolve_media_id_from_post(post_id)
        if not media_id:
            print(f"❌ Post #{post_id} nao encontrado ou sem ig_media_id.")
            return

    session = get_session()
    query = (
        session.query(ConversationLog)
        .filter(ConversationLog.message_type == "comment")
        .order_by(ConversationLog.created_at.desc())
    )
    if media_id:
        query = query.filter(ConversationLog.media_id == media_id)

    logs = query.limit(limit).all()
    session.close()

    if not logs:
        print("📭 Nenhum comentario encontrado.")
        return

    print(
        f"\n{'Log':>4}  {'Quando':<19}  {'Resp.':<5}  {'Source':<18}  {'Reply':<18}  {'Motivo':<18}  Comentario"
    )
    print("-" * 130)
    for log in logs:
        created = log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else "N/A"
        replied = "sim" if log.responded else "nao"
        source_comment_id = getattr(log, "source_comment_id", None) or "-"
        reply_comment_id = getattr(log, "reply_comment_id", None) or "-"
        status_reason = getattr(log, "status_reason", None) or "-"
        incoming_preview = _truncate_preview(log.incoming_text, limit=55)
        print(
            f"{log.id:>4}  {created:<19}  {replied:<5}  {source_comment_id:<18}  "
            f"{reply_comment_id:<18}  {status_reason:<18}  {incoming_preview}"
        )


def show_comment_log(log_id: int):
    log = _load_comment_log(log_id)
    if not log:
        print(f"❌ Log #{log_id} nao encontrado.")
        return

    print(f"👀 Log #{log.id}")
    print(f"   Criado em: {log.created_at}")
    print(f"   IG user id: {log.ig_user_id}")
    print(f"   Media id: {log.media_id or '-'}")
    print(f"   Source comment id: {getattr(log, 'source_comment_id', None) or '-'}")
    print(f"   Reply comment id: {getattr(log, 'reply_comment_id', None) or '-'}")
    print(f"   Respondido: {'sim' if log.responded else 'nao'}")
    print(f"   Motivo: {getattr(log, 'status_reason', None) or '-'}")
    print(f"   Comentario: {log.incoming_text or '-'}")
    print(f"   Resposta: {log.response_text or '-'}")


async def _resolve_source_comment_id(log: ConversationLog, publisher: InstagramPublisher) -> str | None:
    existing = getattr(log, "source_comment_id", None)
    if existing:
        return existing
    if not log.media_id:
        return None

    comments = await publisher.list_media_comments(log.media_id, limit=100)
    expected_text = _normalize_lookup_text(log.incoming_text)
    exact_matches = []
    text_matches = []

    for item in comments:
        text = _normalize_lookup_text(item.get("text"))
        author_id = str(((item.get("from") or {}).get("id")) or "")
        if text != expected_text:
            continue
        text_matches.append(item)
        if log.ig_user_id and author_id == str(log.ig_user_id):
            exact_matches.append(item)

    if exact_matches:
        return exact_matches[0].get("id")
    if len(text_matches) == 1:
        return text_matches[0].get("id")
    return None


async def _resolve_reply_comment_id(
    log: ConversationLog,
    publisher: InstagramPublisher,
    source_comment_id: str,
) -> str | None:
    existing = getattr(log, "reply_comment_id", None)
    if existing:
        return existing

    replies = await publisher.list_comment_replies(source_comment_id, limit=100)
    expected_text = _normalize_lookup_text(log.response_text)
    own_actor_ids = {
        str(publisher.settings.instagram_business_account_id or ""),
        str(publisher.settings.facebook_page_id or ""),
    }
    exact_matches = []
    own_matches = []

    for item in replies:
        author_id = str(((item.get("from") or {}).get("id")) or "")
        if author_id and author_id not in own_actor_ids:
            continue
        own_matches.append(item)
        if expected_text and _normalize_lookup_text(item.get("text")) == expected_text:
            exact_matches.append(item)

    if exact_matches:
        return exact_matches[0].get("id")
    if len(own_matches) == 1:
        return own_matches[0].get("id")
    return None


def _build_repair_message(log: ConversationLog, message: str | None) -> str | None:
    responder = AutoResponder()

    if message:
        clean = re.sub(r"\s+", " ", message).strip()
        if not clean:
            return None
        return responder._truncate_response(clean, MAX_COMMENT_LENGTH)

    return responder._generate_response(
        message=log.incoming_text,
        message_type="comment",
        max_length=MAX_COMMENT_LENGTH,
    )


def _update_log_after_manual_action(
    log_id: int,
    *,
    source_comment_id: str | None,
    reply_comment_id: str | None,
    response_text: str | None,
    responded: bool,
    status_reason: str,
):
    session = get_session()
    log = session.query(ConversationLog).filter_by(id=log_id).first()
    if not log:
        session.close()
        return

    if hasattr(log, "source_comment_id"):
        log.source_comment_id = source_comment_id
    if hasattr(log, "reply_comment_id"):
        log.reply_comment_id = reply_comment_id
    log.response_text = response_text
    log.responded = responded
    if hasattr(log, "status_reason"):
        log.status_reason = status_reason
    session.commit()
    session.close()


async def repair_comment_reply(log_id: int, message: str | None = None, skip_delete: bool = False):
    log = _load_comment_log(log_id)
    if not log:
        print(f"❌ Log #{log_id} nao encontrado.")
        return

    publisher = InstagramPublisher()
    source_comment_id = await _resolve_source_comment_id(log, publisher)
    if not source_comment_id:
        print("❌ Nao foi possivel localizar o comentario original no Instagram.")
        print("   Use uma resposta manual no app ou tente novamente com o comentario ainda visivel no post.")
        return

    new_message = _build_repair_message(log, message)
    if not new_message:
        print("❌ Nao foi possivel gerar a nova resposta.")
        return

    old_reply_comment_id = await _resolve_reply_comment_id(log, publisher, source_comment_id)
    if old_reply_comment_id and not skip_delete:
        await publisher.delete_comment(old_reply_comment_id)
    elif not old_reply_comment_id and not skip_delete:
        print("❌ Nao foi possivel localizar a reply antiga para apagar.")
        print("   Se ela ja foi apagada manualmente, rode novamente com --skip-delete.")
        return

    reply_result = await publisher.reply_to_comment(source_comment_id, new_message)
    new_reply_comment_id = str(reply_result.get("id")) if reply_result.get("id") else None

    _update_log_after_manual_action(
        log_id,
        source_comment_id=source_comment_id,
        reply_comment_id=new_reply_comment_id,
        response_text=new_message,
        responded=True,
        status_reason="manual_republish" if not skip_delete else "manual_republish_skip_delete",
    )

    print(f"✅ Reply republicada para o log #{log_id}.")
    print(f"   Source comment id: {source_comment_id}")
    print(f"   Reply antiga: {old_reply_comment_id or 'nao localizada'}")
    print(f"   Reply nova: {new_reply_comment_id or 'sem id retornado'}")
    print(f"   Nova mensagem: {new_message}")


async def delete_reply(log_id: int):
    log = _load_comment_log(log_id)
    if not log:
        print(f"❌ Log #{log_id} nao encontrado.")
        return

    publisher = InstagramPublisher()
    source_comment_id = await _resolve_source_comment_id(log, publisher)
    if not source_comment_id:
        print("❌ Nao foi possivel localizar o comentario original.")
        return

    reply_comment_id = await _resolve_reply_comment_id(log, publisher, source_comment_id)
    if not reply_comment_id:
        print("❌ Nao foi possivel localizar a reply atual para remover.")
        return

    await publisher.delete_comment(reply_comment_id)
    _update_log_after_manual_action(
        log_id,
        source_comment_id=source_comment_id,
        reply_comment_id=None,
        response_text=log.response_text,
        responded=False,
        status_reason="manual_reply_deleted",
    )

    print(f"🗑️ Reply removida para o log #{log_id}.")
    print(f"   Reply removida: {reply_comment_id}")


def main():
    parser = argparse.ArgumentParser(description="Gerenciar replies de comentarios do Instagram")
    parser.add_argument("--list", action="store_true", help="Listar logs de comentarios")
    parser.add_argument("--post-id", type=int, metavar="ID", help="Filtrar comentarios por post publicado")
    parser.add_argument("--media-id", type=str, metavar="MEDIA_ID", help="Filtrar comentarios por media_id")
    parser.add_argument("--limit", type=int, default=20, help="Limite de linhas para --list (default: 20)")
    parser.add_argument("--show", type=int, metavar="LOG_ID", help="Mostrar um log de comentario completo")
    parser.add_argument("--repair", type=int, metavar="LOG_ID", help="Apagar e republicar uma reply ruim")
    parser.add_argument("--delete-reply", type=int, metavar="LOG_ID", help="Apagar somente a reply atual")
    parser.add_argument("--message", type=str, help="Texto manual para usar com --repair")
    parser.add_argument(
        "--skip-delete",
        action="store_true",
        help="Republicar sem apagar a reply antiga primeiro",
    )

    args = parser.parse_args()
    init_db()

    if args.list:
        list_comment_logs(post_id=args.post_id, media_id=args.media_id, limit=args.limit)
    elif args.show:
        show_comment_log(args.show)
    elif args.repair:
        asyncio.run(repair_comment_reply(args.repair, message=args.message, skip_delete=args.skip_delete))
    elif args.delete_reply:
        asyncio.run(delete_reply(args.delete_reply))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
