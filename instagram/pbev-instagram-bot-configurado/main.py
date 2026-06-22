"""Main FastAPI application with webhook endpoints and scheduler."""

import html
import logging
from collections import Counter
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse

from auto_responder import AutoResponder
from config import get_settings
from database import init_db
from scheduler import create_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + start scheduler. Shutdown: stop scheduler."""
    init_db()
    sched = create_scheduler()
    sched.start()
    logger.info("PBEV Instagram Bot iniciado.")
    yield
    sched.shutdown()
    logger.info("Bot encerrado.")


app = FastAPI(
    title="Guia PBEV Brasil - Instagram Bot",
    version="1.0.0",
    lifespan=lifespan,
)

responder = AutoResponder()


def _isoformat_or_none(value):
    return value.isoformat() if value else None


def _parse_dashboard_date(value: str | None, field_name: str) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"{field_name} deve estar em YYYY-MM-DD") from exc


def _in_date_window(value: datetime | None, start_date: date | None, end_date: date | None) -> bool:
    if value is None:
        return False
    current = value.date()
    if start_date and current < start_date:
        return False
    if end_date and current > end_date:
        return False
    return True


def _fetch_instagram_permalinks(media_ids: list[str]) -> dict[str, str]:
    if not media_ids:
        return {}

    settings = get_settings()
    access_token = settings.meta_access_token
    if not access_token:
        return {}

    unique_ids = list(dict.fromkeys(media_ids))
    permalinks: dict[str, str] = {}

    with httpx.Client(timeout=12) as client:
        try:
            response = client.get(
                f"https://graph.facebook.com/v21.0/{settings.instagram_business_account_id}/media",
                params={
                    "access_token": access_token,
                    "fields": "id,permalink",
                    "limit": max(25, len(unique_ids) * 3),
                },
            )
            if response.is_error:
                return {}

            for item in response.json().get("data", []):
                media_id = item.get("id")
                permalink = item.get("permalink")
                if media_id in unique_ids and permalink:
                    permalinks[media_id] = permalink
        except Exception:
            return {}

    return permalinks


def _build_dashboard_payload(
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict:
    from database import ConversationLog, ScheduledPost, get_session

    settings = get_settings()
    own_actor_ids = {
        settings.instagram_business_account_id,
        settings.facebook_page_id,
    }
    session = get_session()
    posts = session.query(ScheduledPost).order_by(ScheduledPost.scheduled_at).all()
    raw_comment_logs = (
        session.query(ConversationLog)
        .filter(ConversationLog.message_type == "comment")
        .order_by(ConversationLog.created_at.desc())
        .all()
    )
    dm_logs = (
        session.query(ConversationLog)
        .filter(ConversationLog.message_type == "dm")
        .order_by(ConversationLog.created_at.desc())
        .all()
    )
    session.close()

    comment_logs = [
        log for log in raw_comment_logs
        if log.ig_user_id not in own_actor_ids
    ]

    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)

    published_posts = [post for post in posts if post.published]
    pending_posts = [post for post in posts if not post.published]

    filtered_published_posts = [
        post for post in published_posts
        if _in_date_window(post.published_at or post.scheduled_at, start_date, end_date)
    ] if (start_date or end_date) else list(published_posts)

    filtered_pending_posts = [
        post for post in pending_posts
        if _in_date_window(post.scheduled_at, start_date, end_date)
    ] if (start_date or end_date) else list(pending_posts)

    filtered_comment_logs = [
        log for log in comment_logs
        if _in_date_window(log.created_at, start_date, end_date)
    ] if (start_date or end_date) else list(comment_logs)

    filtered_published_posts.sort(
        key=lambda post: post.published_at or post.scheduled_at or datetime.min,
        reverse=True,
    )
    filtered_pending_posts.sort(key=lambda post: post.scheduled_at or datetime.max)

    comments_by_media = Counter(log.media_id for log in filtered_comment_logs if log.media_id)
    replies_by_media = Counter(log.media_id for log in filtered_comment_logs if log.media_id and log.responded)
    published_by_category = Counter((post.category or "geral") for post in filtered_published_posts)
    pending_by_category = Counter((post.category or "geral") for post in filtered_pending_posts)
    ranked_published = sorted(
        filtered_published_posts,
        key=lambda post: comments_by_media.get(post.ig_media_id, 0),
        reverse=True,
    )
    permalink_ids = []
    for post in filtered_published_posts[:12]:
        if post.ig_media_id:
            permalink_ids.append(post.ig_media_id)
    for post in ranked_published[:3]:
        if post.ig_media_id and post.ig_media_id not in permalink_ids:
            permalink_ids.append(post.ig_media_id)
    permalinks = _fetch_instagram_permalinks(permalink_ids)

    recent_published = []
    for post in filtered_published_posts[:12]:
        recent_published.append(
            {
                "id": post.id,
                "category": post.category or "geral",
                "published_at": _isoformat_or_none(post.published_at),
                "scheduled_at": _isoformat_or_none(post.scheduled_at),
                "ig_media_id": post.ig_media_id,
                "instagram_permalink": permalinks.get(post.ig_media_id or ""),
                "comment_count": comments_by_media.get(post.ig_media_id, 0),
                "reply_count": replies_by_media.get(post.ig_media_id, 0),
                "caption_preview": ((post.caption or "").replace("\n", " "))[:140],
            }
        )

    top_commented_post = None
    if ranked_published and comments_by_media.get(ranked_published[0].ig_media_id, 0) > 0:
        lead = ranked_published[0]
        top_commented_post = {
            "id": lead.id,
            "category": lead.category or "geral",
            "published_at": _isoformat_or_none(lead.published_at),
            "ig_media_id": lead.ig_media_id,
            "instagram_permalink": permalinks.get(lead.ig_media_id or ""),
            "comment_count": comments_by_media.get(lead.ig_media_id, 0),
            "reply_count": replies_by_media.get(lead.ig_media_id, 0),
            "caption_preview": ((lead.caption or "").replace("\n", " "))[:180],
        }

    upcoming_posts = []
    for post in filtered_pending_posts[:12]:
        upcoming_posts.append(
            {
                "id": post.id,
                "category": post.category or "geral",
                "scheduled_at": _isoformat_or_none(post.scheduled_at),
                "has_image": bool(post.image_url),
                "caption_preview": ((post.caption or "").replace("\n", " "))[:140],
            }
        )

    recent_comments = []
    for log in filtered_comment_logs[:20]:
        recent_comments.append(
            {
                "created_at": _isoformat_or_none(log.created_at),
                "ig_user_id": log.ig_user_id,
                "media_id": log.media_id,
                "responded": bool(log.responded),
                "incoming_text": (log.incoming_text or "")[:220],
                "response_text": (log.response_text or "")[:220] if log.response_text else "",
            }
        )

    return {
        "summary": {
            "posts_total": len(posts),
            "posts_published": len(filtered_published_posts),
            "posts_planned": len(filtered_pending_posts),
            "planned_with_image": sum(1 for post in filtered_pending_posts if post.image_url),
            "planned_without_image": sum(1 for post in filtered_pending_posts if not post.image_url),
            "comments_tracked": len(filtered_comment_logs),
            "comment_replies_sent": sum(1 for log in filtered_comment_logs if log.responded),
            "comment_replies_pending": sum(1 for log in filtered_comment_logs if not log.responded),
            "comment_reply_rate": round(
                (sum(1 for log in filtered_comment_logs if log.responded) / len(filtered_comment_logs)) * 100, 1
            ) if filtered_comment_logs else 0.0,
            "dms_tracked": len(dm_logs),
            "posts_with_comments": sum(
                1 for post in filtered_published_posts if comments_by_media.get(post.ig_media_id, 0) > 0
            ),
            "published_last_7_days": sum(
                1 for post in published_posts if post.published_at and post.published_at >= last_7_days
            ),
            "comments_last_7_days": sum(
                1 for log in comment_logs if log.created_at and log.created_at >= last_7_days
            ),
        },
        "filters": {
            "start_date": start_date.isoformat() if start_date else "",
            "end_date": end_date.isoformat() if end_date else "",
        },
        "published_by_category": dict(sorted(published_by_category.items())),
        "pending_by_category": dict(sorted(pending_by_category.items())),
        "recent_published": recent_published,
        "upcoming_posts": upcoming_posts,
        "recent_comments": recent_comments,
        "top_commented_post": top_commented_post,
        "generated_at": now.isoformat(),
    }


@app.get("/webhook")
async def webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """Meta webhook verification endpoint."""
    settings = get_settings()

    if hub_mode == "subscribe" and hub_verify_token == settings.webhook_verify_token:
        logger.info("Webhook verificado com sucesso.")
        return int(hub_challenge)

    raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook")
async def webhook_receive(request: Request):
    """Receive Instagram webhook events."""
    body = await request.json()
    settings = get_settings()
    logger.debug("Webhook recebido: %s", body)

    for entry in body.get("entry", []):
        for messaging in entry.get("messaging", []):
            sender_id = messaging.get("sender", {}).get("id")
            message = messaging.get("message", {})
            text = message.get("text")

            if sender_id and text:
                if sender_id in {
                    settings.instagram_business_account_id,
                    settings.facebook_page_id,
                }:
                    logger.info("Ignorando mensagem do proprio bot: %s", sender_id)
                    continue

                logger.info("DM de %s: %s...", sender_id, text[:50])
                try:
                    await responder.handle_dm(sender_id=sender_id, text=text)
                except Exception as e:
                    logger.error("Falha ao processar DM de %s: %s", sender_id, e)

        for change in entry.get("changes", []):
            if change.get("field") != "comments":
                continue

            value = change.get("value", {})
            comment_id = value.get("id")
            text = value.get("text")
            user_id = value.get("from", {}).get("id")
            media_id = value.get("media", {}).get("id")

            if comment_id and text and user_id:
                if user_id in {
                    settings.instagram_business_account_id,
                    settings.facebook_page_id,
                }:
                    logger.info("Ignorando comentario do proprio bot: %s", user_id)
                    continue

                logger.info("Comentario de %s: %s...", user_id, text[:50])
                try:
                    await responder.handle_comment(
                        comment_id=comment_id,
                        text=text,
                        user_id=user_id,
                        media_id=media_id,
                    )
                except Exception as e:
                    logger.error("Falha ao processar comentario de %s: %s", user_id, e)

    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pbev-instagram-bot"}


@app.get("/api/queue")
async def get_queue():
    """List scheduled posts."""
    from database import ScheduledPost, get_session

    session = get_session()
    posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at)
        .limit(20)
        .all()
    )
    session.close()

    return [
        {
            "id": p.id,
            "category": p.category,
            "caption_preview": p.caption[:100] + "..." if len(p.caption) > 100 else p.caption,
            "scheduled_at": p.scheduled_at.isoformat(),
            "has_image": bool(p.image_url),
        }
        for p in posts
    ]


@app.get("/api/dashboard")
async def get_dashboard(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
):
    """Return consolidated publishing and engagement metrics."""
    parsed_start = _parse_dashboard_date(start_date, "start_date")
    parsed_end = _parse_dashboard_date(end_date, "end_date")
    return _build_dashboard_payload(start_date=parsed_start, end_date=parsed_end)


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
):
    """Render an operations dashboard for posts and comment activity."""
    parsed_start = _parse_dashboard_date(start_date, "start_date")
    parsed_end = _parse_dashboard_date(end_date, "end_date")
    payload = _build_dashboard_payload(start_date=parsed_start, end_date=parsed_end)
    summary = payload["summary"]
    filters = payload["filters"]
    top_commented_post = payload.get("top_commented_post")
    today = datetime.utcnow().date()

    def _format_category_label(value: str) -> str:
        return value.replace("_", " ").strip().title() if value else "Geral"

    dashboard_query_parts = []
    if filters["start_date"]:
        dashboard_query_parts.append(f"start_date={filters['start_date']}")
    if filters["end_date"]:
        dashboard_query_parts.append(f"end_date={filters['end_date']}")
    dashboard_query = f"?{'&'.join(dashboard_query_parts)}" if dashboard_query_parts else ""
    json_href = f"/api/dashboard{dashboard_query}"

    if filters["start_date"] and filters["end_date"]:
        period_label = f"{filters['start_date']} ate {filters['end_date']}"
    elif filters["start_date"]:
        period_label = f"Desde {filters['start_date']}"
    elif filters["end_date"]:
        period_label = f"Ate {filters['end_date']}"
    else:
        period_label = "Base completa"

    quick_ranges = [
        ("Hoje", today.isoformat(), today.isoformat()),
        ("7 dias", (today - timedelta(days=6)).isoformat(), today.isoformat()),
        ("30 dias", (today - timedelta(days=29)).isoformat(), today.isoformat()),
        ("Tudo", "", ""),
    ]

    def _render_category_rows(items: dict[str, int]) -> str:
        if not items:
            return '<tr><td colspan="2" class="muted">Sem dados</td></tr>'
        total_items = sum(items.values()) or 1
        return "".join(
            f"""
            <tr>
              <td>
                <div class="category-cell">
                  <div class="category-name">{html.escape(_format_category_label(category))}</div>
                  <div class="category-meter"><span style="width: {max(10, round((total / total_items) * 100))}%"></span></div>
                </div>
              </td>
              <td class="category-total">{total}</td>
            </tr>
            """
            for category, total in items.items()
        )

    def _render_quick_ranges() -> str:
        links = []
        for label, range_start, range_end in quick_ranges:
            href = "/dashboard"
            if range_start and range_end:
                href = f"/dashboard?start_date={range_start}&end_date={range_end}"
            active = filters["start_date"] == range_start and filters["end_date"] == range_end
            links.append(
                f'<a class="range-chip{" active" if active else ""}" href="{href}">{html.escape(label)}</a>'
            )
        return "".join(links)

    def _render_published_rows(items: list[dict]) -> str:
        if not items:
            return '<tr><td colspan="5" class="muted">Nenhum post publicado ainda.</td></tr>'
        rows = []
        for item in items:
            instagram_action = (
                f'<a class="table-link" href="{html.escape(item["instagram_permalink"])}" target="_blank" rel="noreferrer">Instagram</a>'
                if item["instagram_permalink"]
                else '<span class="muted">Sem link</span>'
            )
            rows.append(
                f"""
                <tr>
                  <td>
                    <div class="post-id"><a href="/preview/{item['id']}">#{item['id']}</a></div>
                    <span class="badge">{html.escape(_format_category_label(item['category']))}</span>
                  </td>
                  <td>{html.escape(item['published_at'] or '-')}</td>
                  <td>
                    <div class="metric-inline"><strong>{item['comment_count']}</strong><span>comentarios</span></div>
                    <div class="metric-inline"><strong>{item['reply_count']}</strong><span>respostas</span></div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a class="table-link" href="/preview/{item['id']}">Preview</a>
                      {instagram_action}
                    </div>
                  </td>
                  <td><div class="caption-snippet">{html.escape(item['caption_preview'])}</div></td>
                </tr>
                """
            )
        return "".join(rows)

    def _render_upcoming_rows(items: list[dict]) -> str:
        if not items:
            return '<tr><td colspan="4" class="muted">Nenhum post pendente.</td></tr>'
        rows = []
        for item in items:
            asset_label = "Imagem pronta" if item["has_image"] else "Sem imagem"
            asset_class = "ok" if item["has_image"] else "danger"
            rows.append(
                f"""
                <tr>
                  <td>
                    <div class="post-id"><a href="/preview/{item['id']}">#{item['id']}</a></div>
                    <span class="badge">{html.escape(_format_category_label(item['category']))}</span>
                  </td>
                  <td>{html.escape(item['scheduled_at'] or '-')}</td>
                  <td><span class="{asset_class}">{asset_label}</span></td>
                  <td><div class="caption-snippet">{html.escape(item['caption_preview'])}</div></td>
                </tr>
                """
            )
        return "".join(rows)

    def _render_comment_rows(items: list[dict]) -> str:
        if not items:
            return '<tr><td colspan="6" class="muted">Nenhum comentário rastreado.</td></tr>'
        rows = []
        for item in items:
            status_class = "ok" if item["responded"] else "warn"
            status_label = "Respondido" if item["responded"] else "Pendente"
            rows.append(
                f"""
                <tr>
                  <td>{html.escape(item['created_at'] or '-')}</td>
                  <td>{html.escape(item['ig_user_id'] or '-')}</td>
                  <td>{html.escape(item['media_id'] or '-')}</td>
                  <td><span class="{status_class}">{status_label}</span></td>
                  <td><div class="caption-snippet">{html.escape(item['incoming_text'])}</div></td>
                  <td><div class="caption-snippet">{html.escape(item['response_text'] or '-')}</div></td>
                </tr>
                """
            )
        return "".join(rows)

    if top_commented_post:
        spotlight_instagram = (
            f'<a class="spotlight-link" href="{html.escape(top_commented_post["instagram_permalink"])}" target="_blank" rel="noreferrer">Abrir no Instagram</a>'
            if top_commented_post["instagram_permalink"]
            else '<span class="muted-light">Instagram sem permalink</span>'
        )
        spotlight_content = f"""
        <div class="spotlight-label">Pulso do feed</div>
        <h2 class="spotlight-title">Post com maior volume de comentários</h2>
        <div class="spotlight-meta">
          <span class="badge badge-light">{html.escape(_format_category_label(top_commented_post['category']))}</span>
          <span>Publicado em {html.escape(top_commented_post['published_at'] or '-')}</span>
        </div>
        <div class="spotlight-stats">
          <div><strong>{top_commented_post['comment_count']}</strong><span>comentarios</span></div>
          <div><strong>{top_commented_post['reply_count']}</strong><span>respostas</span></div>
        </div>
        <p class="spotlight-caption">{html.escape(top_commented_post['caption_preview'])}</p>
        <div class="spotlight-actions">
          <a class="spotlight-link primary" href="/preview/{top_commented_post['id']}">Abrir preview</a>
          {spotlight_instagram}
        </div>
        """
    else:
        spotlight_content = """
        <div class="spotlight-label">Pulso do feed</div>
        <h2 class="spotlight-title">Nenhum post com comentários no período</h2>
        <p class="spotlight-caption">
          Ajuste a janela de datas para inspecionar outros intervalos ou acompanhe os próximos posts planejados no bloco abaixo.
        </p>
        """

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard do Bot PBEV</title>
  <style>
    :root {{
      color-scheme: light;
      --bg: #f6f1e8;
      --bg-2: #edf3ea;
      --panel: rgba(255, 255, 255, .78);
      --panel-strong: #173428;
      --text: #18241d;
      --muted: #647469;
      --accent: #1d7f5f;
      --accent-2: #bf6f29;
      --line: rgba(24, 36, 29, .10);
      --danger: #b85749;
      --shadow: 0 24px 64px rgba(31, 47, 38, .12);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(29,127,95,.16), transparent 28%),
        radial-gradient(circle at top right, rgba(191,111,41,.18), transparent 24%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
      color: var(--text);
      font-family: "Aptos", "Trebuchet MS", "Segoe UI", sans-serif;
    }}
    .page {{
      max-width: 1460px;
      margin: 0 auto;
      padding: 28px 20px 48px;
    }}
    .hero-shell {{
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(320px, .95fr);
      gap: 18px;
      margin-bottom: 18px;
    }}
    .card {{
      background: var(--panel);
      border: 1px solid rgba(255,255,255,.62);
      border-radius: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(16px);
    }}
    .hero {{
      padding: 24px;
    }}
    .eyebrow {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(29,127,95,.10);
      color: var(--accent);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-weight: 700;
    }}
    .title {{
      font-size: 40px;
      line-height: 1.02;
      margin: 16px 0 10px;
      font-weight: 800;
      letter-spacing: -.03em;
    }}
    .subtitle {{
      color: var(--muted);
      line-height: 1.6;
      max-width: 800px;
    }}
    .overview {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }}
    .chip {{
      border: 1px solid rgba(24, 36, 29, .08);
      background: rgba(255,255,255,.7);
      border-radius: 999px;
      padding: 10px 14px;
      color: var(--text);
      font-size: 13px;
    }}
    .filters {{
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: end;
      margin-top: 18px;
    }}
    .field {{
      min-width: 180px;
    }}
    .field label {{
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .field input {{
      width: 100%;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.82);
      color: var(--text);
      padding: 12px 13px;
      font-size: 14px;
    }}
    .button {{
      border: 1px solid rgba(29,127,95,.18);
      background: var(--accent);
      color: #f7fff8;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      font-weight: 700;
    }}
    .button.secondary {{
      background: rgba(255,255,255,.8);
      color: var(--text);
    }}
    .range-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }}
    .range-chip {{
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 9px 14px;
      border: 1px solid rgba(24,36,29,.1);
      background: rgba(255,255,255,.64);
      color: var(--text);
      font-size: 13px;
      text-decoration: none;
    }}
    .range-chip.active {{
      background: var(--panel-strong);
      border-color: var(--panel-strong);
      color: #f4fbf5;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }}
    .metric {{
      padding: 18px;
      min-height: 150px;
      position: relative;
      overflow: hidden;
    }}
    .metric::after {{
      content: "";
      position: absolute;
      inset: auto -24px -36px auto;
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba(29,127,95,.18), transparent 70%);
    }}
    .metric-label {{
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .09em;
      margin-bottom: 10px;
    }}
    .metric-value {{
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 6px;
    }}
    .metric-note {{
      color: var(--muted);
      line-height: 1.5;
      font-size: 14px;
    }}
    .layout {{
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }}
    .stack {{
      display: grid;
      gap: 16px;
    }}
    .panel-head {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 18px 20px 8px;
    }}
    .panel-title {{
      margin: 0;
      font-size: 18px;
      font-weight: 750;
    }}
    .panel-subtitle {{
      color: var(--muted);
      font-size: 13px;
    }}
    .table-wrap {{
      overflow-x: auto;
      padding: 8px 12px 14px;
    }}
    table {{
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 10px;
      font-size: 14px;
    }}
    th, td {{
      text-align: left;
      padding: 14px 10px;
      vertical-align: top;
    }}
    th {{
      color: var(--muted);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      padding-bottom: 0;
    }}
    tbody td {{
      background: rgba(255,255,255,.72);
      border-top: 1px solid rgba(255,255,255,.65);
      border-bottom: 1px solid rgba(24,36,29,.05);
    }}
    tbody td:first-child {{
      border-radius: 18px 0 0 18px;
      padding-left: 14px;
    }}
    tbody td:last-child {{
      border-radius: 0 18px 18px 0;
      padding-right: 14px;
    }}
    .post-id {{
      font-weight: 800;
      font-size: 15px;
    }}
    .badge {{
      display: inline-flex;
      align-items: center;
      margin-top: 8px;
      padding: 5px 10px;
      border-radius: 999px;
      background: rgba(29,127,95,.10);
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
    }}
    .badge-light {{
      margin: 0;
      background: rgba(255,255,255,.16);
      color: #f6fff7;
    }}
    .table-actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }}
    .table-link {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 11px;
      border-radius: 12px;
      border: 1px solid rgba(24,36,29,.08);
      background: rgba(255,255,255,.92);
      color: var(--text);
      font-weight: 700;
      text-decoration: none;
    }}
    .metric-inline {{
      display: flex;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 4px;
    }}
    .metric-inline strong {{
      font-size: 18px;
    }}
    .metric-inline span {{
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }}
    .caption-snippet {{
      line-height: 1.55;
      color: var(--text);
      max-width: 560px;
    }}
    .category-cell {{
      min-width: 180px;
    }}
    .category-name {{
      font-weight: 700;
      margin-bottom: 8px;
    }}
    .category-meter {{
      width: 100%;
      height: 9px;
      border-radius: 999px;
      background: rgba(24,36,29,.08);
      overflow: hidden;
    }}
    .category-meter span {{
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--accent), #5bb792);
    }}
    .category-total {{
      font-weight: 800;
      font-size: 18px;
    }}
    .spotlight {{
      position: relative;
      overflow: hidden;
      padding: 24px;
      background: linear-gradient(135deg, #173428 0%, #246f57 100%);
      color: #f4fbf5;
      border-color: rgba(255,255,255,.12);
    }}
    .spotlight::after {{
      content: "";
      position: absolute;
      right: -40px;
      top: -40px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: rgba(255,255,255,.08);
    }}
    .spotlight-label {{
      font-size: 12px;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: rgba(244,251,245,.74);
      margin-bottom: 12px;
      font-weight: 700;
    }}
    .spotlight-title {{
      margin: 0 0 10px;
      font-size: 30px;
      line-height: 1.06;
    }}
    .spotlight-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      color: rgba(244,251,245,.78);
      margin-bottom: 18px;
    }}
    .spotlight-stats {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 16px;
    }}
    .spotlight-stats div {{
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,.08);
    }}
    .spotlight-stats strong {{
      display: block;
      font-size: 28px;
      margin-bottom: 4px;
    }}
    .spotlight-stats span,
    .muted-light {{
      color: rgba(244,251,245,.72);
    }}
    .spotlight-caption {{
      position: relative;
      z-index: 1;
      line-height: 1.65;
      color: rgba(244,251,245,.88);
      margin: 0 0 18px;
    }}
    .spotlight-actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      position: relative;
      z-index: 1;
    }}
    .spotlight-link {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 14px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.08);
      color: #f5fff6;
      font-weight: 700;
      text-decoration: none;
    }}
    .spotlight-link.primary {{
      background: rgba(255,255,255,.94);
      color: #173428;
    }}
    .muted {{
      color: var(--muted);
    }}
    .ok {{
      color: var(--accent);
      font-weight: 700;
    }}
    .warn {{
      color: var(--accent-2);
      font-weight: 700;
    }}
    .danger {{
      color: var(--danger);
      font-weight: 700;
    }}
    a {{
      color: inherit;
      text-decoration: none;
    }}
    a:hover {{
      opacity: .95;
    }}
    @media (max-width: 1180px) {{
      .hero-shell,
      .layout {{
        grid-template-columns: 1fr;
      }}
    }}
    @media (max-width: 720px) {{
      .page {{
        padding-left: 14px;
        padding-right: 14px;
      }}
      .title {{
        font-size: 30px;
      }}
      .spotlight-title {{
        font-size: 24px;
      }}
      .spotlight-stats {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <div class="page">
    <div class="hero-shell">
      <section class="card hero">
        <div class="eyebrow">Operacao Instagram</div>
        <h1 class="title">Dashboard do Bot PBEV</h1>
        <div class="subtitle">
          Painel operacional para acompanhar publicações, fila futura e resposta a comentários.
          Atualizado em {html.escape(payload['generated_at'])}.
        </div>
        <form class="filters" method="get" action="/dashboard">
          <div class="field">
            <label for="start_date">Data inicial</label>
            <input id="start_date" name="start_date" type="date" value="{html.escape(filters['start_date'])}">
          </div>
          <div class="field">
            <label for="end_date">Data final</label>
            <input id="end_date" name="end_date" type="date" value="{html.escape(filters['end_date'])}">
          </div>
          <button class="button" type="submit">Aplicar filtro</button>
          <a class="button secondary" href="/dashboard">Limpar</a>
          <a class="button secondary" href="{json_href}">Ver JSON</a>
        </form>
        <div class="range-row">{_render_quick_ranges()}</div>
        <div class="overview">
          <span class="chip">Periodo: {html.escape(period_label)}</span>
          <span class="chip">Enviados 7d: {summary['published_last_7_days']}</span>
          <span class="chip">Comentarios 7d: {summary['comments_last_7_days']}</span>
          <span class="chip">Posts com comentarios: {summary['posts_with_comments']}</span>
          <span class="chip">Sem imagem: {summary['planned_without_image']}</span>
        </div>
      </section>

      <aside class="card spotlight">
        {spotlight_content}
      </aside>
    </div>

    <div class="grid">
      <div class="card metric">
        <div class="metric-label">Posts enviados</div>
        <div class="metric-value">{summary['posts_published']}</div>
        <div class="metric-note">Publicados pelo scheduler ou manualmente dentro do período selecionado.</div>
      </div>
      <div class="card metric">
        <div class="metric-label">Posts planejados</div>
        <div class="metric-value">{summary['posts_planned']}</div>
        <div class="metric-note">Pendentes na fila. Com imagem: <span class="ok">{summary['planned_with_image']}</span>.</div>
      </div>
      <div class="card metric">
        <div class="metric-label">Comentários rastreados</div>
        <div class="metric-value">{summary['comments_tracked']}</div>
        <div class="metric-note">Comentários salvos em <code>conversation_logs</code>.</div>
      </div>
      <div class="card metric">
        <div class="metric-label">Respostas enviadas</div>
        <div class="metric-value">{summary['comment_replies_sent']}</div>
        <div class="metric-note">Taxa de resposta: <span class="warn">{summary['comment_reply_rate']}%</span>.</div>
      </div>
      <div class="card metric">
        <div class="metric-label">Comentários pendentes</div>
        <div class="metric-value">{summary['comment_replies_pending']}</div>
        <div class="metric-note">Comentários ainda sem resposta registrada no período.</div>
      </div>
    </div>

    <div class="layout">
      <section class="card">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Posts publicados recentemente</h2>
            <div class="panel-subtitle">Cada linha combina preview interno, permalink do Instagram e sinais de engajamento.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Publicado em</th>
                <th>Engajamento</th>
                <th>Ações</th>
                <th>Legenda</th>
              </tr>
            </thead>
            <tbody>{_render_published_rows(payload['recent_published'])}</tbody>
          </table>
        </div>
      </section>

      <div class="stack">
        <section class="card">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">Categorias enviadas</h2>
              <div class="panel-subtitle">Distribuição visual dos posts publicados no intervalo.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Categoria</th><th>Total</th></tr></thead>
              <tbody>{_render_category_rows(payload['published_by_category'])}</tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">Categorias planejadas</h2>
              <div class="panel-subtitle">Ajuda a ver se a fila futura está equilibrada.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Categoria</th><th>Total</th></tr></thead>
              <tbody>{_render_category_rows(payload['pending_by_category'])}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <div class="layout">
      <section class="card">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Próximos posts planejados</h2>
            <div class="panel-subtitle">Os próximos itens da fila, com indicação clara de imagem pronta ou pendente.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Agendado</th>
                <th>Ativos</th>
                <th>Legenda</th>
              </tr>
            </thead>
            <tbody>{_render_upcoming_rows(payload['upcoming_posts'])}</tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Comentários recentes</h2>
            <div class="panel-subtitle">Painel tático para ver o que entrou, o que foi respondido e o que ainda está pendente.</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quando</th>
                <th>Usuário</th>
                <th>Media ID</th>
                <th>Status</th>
                <th>Comentário</th>
                <th>Resposta</th>
              </tr>
            </thead>
            <tbody>{_render_comment_rows(payload['recent_comments'])}</tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</body>
</html>"""


@app.get("/preview/{post_id}", response_class=HTMLResponse)
async def preview_post(post_id: int):
    """Render a browser-friendly preview of a queued post."""
    from database import ScheduledPost, get_session

    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()
    session.close()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    caption = (post.caption or "").strip()
    hashtags = (post.hashtags or "").strip()
    full_caption = caption if not hashtags else f"{caption}\n\n{hashtags}"
    status_label = "Publicado" if post.published else "Pendente"
    image_block = (
        f'<img src="{html.escape(post.image_url)}" alt="Preview do post" class="post-image">'
        if post.image_url
        else '<div class="post-image empty">Sem imagem gerada</div>'
    )

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview Post #{post.id}</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #10151c;
      --panel: #171e27;
      --panel-2: #1f2833;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --accent: #0d9f6e;
      --line: rgba(255,255,255,.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(13,159,110,.25), transparent 30%),
        linear-gradient(180deg, #0f141b 0%, #111827 100%);
      color: var(--text);
      font-family: "Segoe UI", Arial, sans-serif;
    }}
    .page {{
      max-width: 1320px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
    }}
    .title {{
      font-size: 30px;
      font-weight: 800;
      margin: 0 0 8px;
    }}
    .meta {{
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
    }}
    .layout {{
      display: grid;
      grid-template-columns: minmax(320px, 760px) minmax(300px, 420px);
      gap: 24px;
      align-items: start;
    }}
    .card {{
      background: rgba(23,30,39,.88);
      border: 1px solid var(--line);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 18px 48px rgba(0,0,0,.28);
    }}
    .post-image {{
      display: block;
      width: 100%;
      height: auto;
      background: #0b1016;
    }}
    .post-image.empty {{
      min-height: 540px;
      display: grid;
      place-items: center;
      color: var(--muted);
      font-size: 20px;
    }}
    .caption {{
      padding: 24px;
      background: rgba(14,19,27,.92);
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 16px;
    }}
    .side {{
      padding: 24px;
    }}
    .pill {{
      display: inline-block;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(13,159,110,.16);
      color: #b6f3de;
      font-size: 13px;
      font-weight: 700;
      margin: 0 8px 8px 0;
    }}
    .label {{
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 6px;
    }}
    .value {{
      font-size: 16px;
      margin-bottom: 18px;
    }}
    .caption-box {{
      background: rgba(31,40,51,.7);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 18px;
      white-space: pre-wrap;
      line-height: 1.65;
      font-size: 15px;
    }}
    @media (max-width: 980px) {{
      .layout {{
        grid-template-columns: 1fr;
      }}
      .header {{
        flex-direction: column;
      }}
    }}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">Preview do Post #{post.id}</h1>
        <div class="meta">
          Categoria: {html.escape(post.category or "geral")}<br>
          Agendado: {html.escape(post.scheduled_at.isoformat() if post.scheduled_at else "N/A")}
        </div>
      </div>
      <div>
        <span class="pill">{status_label}</span>
        <span class="pill">{'Com imagem' if post.image_url else 'Sem imagem'}</span>
      </div>
    </div>
    <div class="layout">
      <div class="card">
        {image_block}
        <div class="caption">{html.escape(caption)}</div>
      </div>
      <div class="card side">
        <div class="label">Legenda completa</div>
        <div class="caption-box">{html.escape(full_caption)}</div>
        <div class="label" style="margin-top:18px;">Imagem</div>
        <div class="value">{html.escape(post.image_url or "Sem imagem")}</div>
      </div>
    </div>
  </div>
</body>
</html>"""


@app.post("/api/generate")
async def trigger_generation(days: int = 7):
    """Force content generation."""
    from content_generator import generate_weekly_content, save_posts_to_queue

    posts = generate_weekly_content()
    count = save_posts_to_queue(posts)
    return {"generated": count, "message": f"{count} posts gerados e agendados."}


@app.get("/api/analytics")
async def get_analytics():
    """Return Plausible insights for the last 30 days."""
    from analytics import get_content_insights

    try:
        insights = await get_content_insights()
        return {
            "status": "ok",
            "ig_traffic": insights.get("ig_traffic", {}),
            "best_categories": insights.get("best_categories", []),
            "top_pages": insights.get("top_pages", []),
            "recommendation": insights.get("recommendation", ""),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level=settings.log_level.lower(),
    )
