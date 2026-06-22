"""CLI para gerenciar a fila de publicação.

Uso:
    python manage_queue.py --list                    # Listar pendentes
    python manage_queue.py --list --all              # Listar todos (incluindo publicados)
    python manage_queue.py --delete 5                # Remover post #5
    python manage_queue.py --reschedule 5 "2026-04-01 10:00"  # Reagendar
    python manage_queue.py --add-image 5 /path/to/image.jpg   # Adicionar imagem
    python manage_queue.py --generate-images         # Gerar imagens faltantes
    python manage_queue.py --reset-post 7            # Regenerar um post específico
    python manage_queue.py --reset-post 7 --topic "GWM Ora 03 Skin BEV48 vs BYD Dolphin GS"
    python manage_queue.py --reset-grounded-posts    # Regenerar posts aterrados na fonte
    python manage_queue.py --refresh-pending --start-at "2026-04-02 09:00"
    python manage_queue.py --stats                   # Estatísticas
"""

import argparse
import sys
from collections import defaultdict, deque
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from database import GenerationEvent, get_session, ScheduledPost, init_db
from config import get_settings
from cost_tracking import (
    apply_cost_metadata,
    build_image_cost_metadata,
    estimate_text_cost_usd,
    merge_cost_metadata,
    rough_token_estimate,
    usd_to_brl,
)
from image_generator import AI_IMAGE_CATEGORIES, _find_matching_vehicles, generate_and_host_post_image
from schedule_utils import assign_categories_to_slots, build_daily_slot_datetimes

GROUNDED_CATEGORIES = ("modelo_destaque", "comparativo", "tco_insight")


def _caption_headline(text: str | None) -> str:
    return (text or "").splitlines()[0].strip().lower()


def build_preview_url(post_id: int) -> str:
    settings = get_settings()
    base = settings.webhook_base_url or settings.image_host_base_url
    return f"{base}/preview/{post_id}"


def _derive_topic_from_post(post: ScheduledPost) -> str | None:
    matches = _find_matching_vehicles(post.caption or "", limit=2)
    if post.category == "comparativo" and len(matches) >= 2:
        return f"{matches[0]['brand']} {matches[0]['model']} vs {matches[1]['brand']} {matches[1]['model']}"
    if matches:
        vehicle = matches[0]
        return f"{vehicle['brand']} {vehicle['model']}"

    first_line = (post.caption or "").splitlines()[0].strip()
    return first_line or None


def _regenerate_existing_post(post: ScheduledPost, sync_catalog_first: bool, topic_override: str | None = None):
    from content_generator import generate_single_post, sync_vehicle_catalog

    topic = topic_override

    if sync_catalog_first:
        sync_vehicle_catalog()

    new_post = generate_single_post(
        post.category,
        topic=topic,
        sync_catalog_first=False,
        generation_source="reset_post",
    )
    image_path, image_url, image_cost_meta = generate_and_host_post_image(
        caption=new_post["caption"],
        category=post.category or "geral",
        subtitle=new_post.get("image_prompt", ""),
        source_vehicles=new_post.get("source_vehicles"),
        generation_source="reset_post",
        return_metadata=True,
    )

    post.caption = new_post["caption"]
    post.hashtags = new_post.get("hashtags", "")
    post.image_path = image_path
    post.image_url = image_url
    apply_cost_metadata(
        post,
        merge_cost_metadata(
            text_meta=new_post.get("text_cost_meta"),
            image_meta=image_cost_meta,
        ),
    )


def list_posts(show_all: bool = False):
    session = get_session()
    query = session.query(ScheduledPost).order_by(ScheduledPost.scheduled_at)

    if not show_all:
        query = query.filter(ScheduledPost.published == False)

    posts = query.all()

    if not posts:
        print("📭 Nenhum post na fila.")
        return

    print(f"\n{'ID':>4}  {'Status':>6}  {'Categoria':<18}  {'Agendado para':<20}  {'Imagem':>6}  Legenda")
    print("-" * 100)

    for p in posts:
        status = "✅" if p.published else "⏳"
        has_img = "✅" if p.image_url else "❌"
        caption_preview = p.caption[:40].replace("\n", " ") + "..." if len(p.caption) > 40 else p.caption.replace("\n", " ")
        scheduled = p.scheduled_at.strftime("%Y-%m-%d %H:%M") if p.scheduled_at else "N/A"
        print(f"{p.id:>4}  {status:>6}  {p.category:<18}  {scheduled:<20}  {has_img:>6}  {caption_preview}")

    print(f"\nTotal: {len(posts)} posts")
    session.close()


def delete_post(post_id: int):
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        return

    if post.published:
        print(f"⚠️ Post #{post_id} já foi publicado. Tem certeza? (s/n)")
        if input().strip().lower() != "s":
            print("Cancelado.")
            return

    session.delete(post)
    session.commit()
    print(f"🗑️ Post #{post_id} removido.")
    session.close()


def reschedule_post(post_id: int, new_datetime: str):
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        return

    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)

    try:
        new_dt = datetime.strptime(new_datetime, "%Y-%m-%d %H:%M").replace(tzinfo=tz)
    except ValueError:
        print("❌ Formato inválido. Use: YYYY-MM-DD HH:MM")
        return

    old_dt = post.scheduled_at
    post.scheduled_at = new_dt
    session.commit()
    print(f"📅 Post #{post_id} reagendado: {old_dt} → {new_dt}")
    session.close()


def add_image_to_post(post_id: int, image_url: str):
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        return

    post.image_url = image_url
    session.commit()
    print(f"🖼️ Imagem adicionada ao post #{post_id}: {image_url}")
    session.close()


def generate_missing_images():
    session = get_session()
    posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == False,
            ScheduledPost.image_url == None,
        )
        .order_by(ScheduledPost.scheduled_at)
        .all()
    )

    if not posts:
        print("✅ Nenhum post pendente sem imagem.")
        session.close()
        return

    generated = 0
    for post in posts:
        try:
            image_path, image_url, image_cost_meta = generate_and_host_post_image(
                caption=post.caption,
                category=post.category or "geral",
                generation_source="generate_missing_images",
                return_metadata=True,
            )
            post.image_path = image_path
            post.image_url = image_url
            apply_cost_metadata(
                post,
                merge_cost_metadata(
                    text_meta={
                        "text_provider": post.text_provider,
                        "text_model": post.text_model,
                        "text_input_tokens": post.text_input_tokens,
                        "text_output_tokens": post.text_output_tokens,
                        "text_total_tokens": post.text_total_tokens,
                        "text_cost_source": post.text_cost_source,
                        "text_cost_usd": post.text_cost_usd,
                    },
                    image_meta=image_cost_meta,
                ),
            )
            generated += 1
            print(f"🖼️ Post #{post.id} atualizado com imagem: {image_url}")
        except Exception as e:
            print(f"❌ Falha ao gerar imagem para post #{post.id}: {e}")

    session.commit()
    session.close()
    print(f"\n✅ {generated} posts atualizados com imagem.")


def reset_grounded_posts():
    from content_generator import sync_vehicle_catalog

    session = get_session()
    posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == False,
            ScheduledPost.category.in_(GROUNDED_CATEGORIES),
        )
        .order_by(ScheduledPost.scheduled_at)
        .all()
    )

    if not posts:
        print("✅ Nenhum post pendente das categorias aterradas.")
        session.close()
        return

    sync_vehicle_catalog()
    print(f"♻️ Regenerando {len(posts)} posts das categorias aterradas...")
    reset_count = 0

    for post in posts:
        try:
            _regenerate_existing_post(post, sync_catalog_first=False)
            reset_count += 1
            print(f"🔄 Post #{post.id} regenerado [{post.category}]")
        except Exception as e:
            print(f"❌ Falha ao regenerar post #{post.id}: {e}")

    session.commit()
    session.close()
    print(f"\n✅ {reset_count} posts regenerados com nova legenda e imagem.")


def reset_post(post_id: int, topic_override: str | None = None):
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        session.close()
        return

    if post.published:
        print(f"⚠️ Post #{post_id} já foi publicado; não será regenerado.")
        session.close()
        return

    try:
        _regenerate_existing_post(post, sync_catalog_first=True, topic_override=topic_override)
        session.commit()
        print(f"✅ Post #{post.id} regenerado [{post.category}]")
    except Exception as e:
        print(f"❌ Falha ao regenerar post #{post.id}: {e}")
    finally:
        session.close()


def _legacy_refresh_pending_posts(
    start_at: str | None = None,
    interval_hours: int = 24,
):
    """Regenera todos os posts pendentes e opcionalmente redistribui agenda."""
    from content_generator import sync_vehicle_catalog

    session = get_session()
    posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at, ScheduledPost.id)
        .all()
    )

    if not posts:
        print("✅ Nenhum post pendente para atualizar.")
        session.close()
        return

    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    start_dt = None
    if start_at:
        try:
            start_dt = datetime.strptime(start_at, "%Y-%m-%d %H:%M").replace(tzinfo=tz)
        except ValueError:
            print("❌ Formato inválido para --start-at. Use: YYYY-MM-DD HH:MM")
            session.close()
            return

    sync_vehicle_catalog()
    print(f"♻️ Atualizando {len(posts)} posts pendentes...")

    updated = 0
    for index, post in enumerate(posts):
        try:
            _regenerate_existing_post(post, sync_catalog_first=False)
            if start_dt is not None:
                post.scheduled_at = start_dt + timedelta(hours=interval_hours * index)
            updated += 1
            print(f"🔄 Post #{post.id} atualizado [{post.category}]")
        except Exception as e:
            print(f"❌ Falha ao atualizar post #{post.id}: {e}")

    session.commit()
    session.close()
    print(f"\n✅ {updated} posts pendentes atualizados.")
    if start_dt is not None:
        print(f"📅 Nova agenda iniciando em {start_dt} com intervalo de {interval_hours}h.")


def _legacy_rebalance_pending_posts():
    """Redistribui posts pendentes pelos slots atuais sem repetir categoria no mesmo dia."""
    session = get_session()
    pending_posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at, ScheduledPost.id)
        .all()
    )

    if not pending_posts:
        print("âœ… Nenhum post pendente para reagendar.")
        session.close()
        return

    fixed_posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == True,
            ScheduledPost.scheduled_at != None,
        )
        .all()
    )

    blocked_categories_by_day: dict = defaultdict(set)
    for post in fixed_posts:
        blocked_categories_by_day[post.scheduled_at.date()].add(post.category or "geral")

    slot_datetimes = [post.scheduled_at for post in pending_posts]
    category_sequence = [post.category or "geral" for post in pending_posts]
    assigned_categories = assign_categories_to_slots(
        slot_datetimes,
        category_sequence,
        blocked_categories_by_day=blocked_categories_by_day,
    )

    posts_by_category: dict[str, deque[ScheduledPost]] = defaultdict(deque)
    for post in pending_posts:
        posts_by_category[post.category or "geral"].append(post)

    changes = 0
    for slot_dt, category in zip(slot_datetimes, assigned_categories):
        post = posts_by_category[category].popleft()
        if post.scheduled_at != slot_dt:
            changes += 1
        post.scheduled_at = slot_dt

    session.commit()
    session.close()
    print(f"âœ… Fila pendente rebalanceada em {len(slot_datetimes)} slots.")
    print(f"ðŸ” Posts movidos para outro horario: {changes}")


def _build_pending_daily_schedule(
    session,
    posts: list[ScheduledPost],
    start_at: str | None = None,
    interval_hours: int = 24,
):
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)

    if start_at:
        try:
            start_dt = datetime.strptime(start_at, "%Y-%m-%d %H:%M").replace(tzinfo=tz)
        except ValueError as exc:
            raise ValueError("Formato invalido para --start-at. Use: YYYY-MM-DD HH:MM") from exc
    else:
        start_dt = next((post.scheduled_at for post in posts if post.scheduled_at), None)
        if start_dt is None:
            start_dt = datetime.now(tz).replace(second=0, microsecond=0)

    day_interval = max(1, (interval_hours + 23) // 24)
    occupied_dates = {
        post.scheduled_at.date()
        for post in session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == True,
            ScheduledPost.scheduled_at != None,
        )
        .all()
    }

    slot_datetimes = build_daily_slot_datetimes(
        start_dt=start_dt,
        total_slots=len(posts),
        occupied_dates=occupied_dates,
        preserve_start_time_for_first_slot=True,
        day_interval=day_interval,
    )
    category_sequence = [post.category or "geral" for post in posts]
    assigned_categories = assign_categories_to_slots(slot_datetimes, category_sequence)

    posts_by_category: dict[str, deque[ScheduledPost]] = defaultdict(deque)
    for post in posts:
        posts_by_category[post.category or "geral"].append(post)

    return [
        (posts_by_category[category].popleft(), slot_dt)
        for slot_dt, category in zip(slot_datetimes, assigned_categories)
    ], day_interval


def refresh_pending_posts(
    start_at: str | None = None,
    interval_hours: int = 24,
):
    """Regenera todos os posts pendentes e recompõe a agenda em no máximo um post por dia."""
    from content_generator import sync_vehicle_catalog

    session = get_session()
    posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at, ScheduledPost.id)
        .all()
    )

    if not posts:
        print("Nenhum post pendente para atualizar.")
        session.close()
        return

    try:
        scheduled_posts, day_interval = _build_pending_daily_schedule(
            session=session,
            posts=posts,
            start_at=start_at,
            interval_hours=interval_hours,
        )
    except ValueError as exc:
        print(str(exc))
        session.close()
        return

    if interval_hours < 24:
        print("Intervalos menores que 24h foram ajustados para preservar no maximo 1 post por dia.")

    sync_vehicle_catalog()
    print(f"Atualizando {len(posts)} posts pendentes...")

    updated = 0
    for post, slot_dt in scheduled_posts:
        try:
            _regenerate_existing_post(post, sync_catalog_first=False)
            post.scheduled_at = slot_dt
            updated += 1
            print(f"Post #{post.id} atualizado [{post.category}]")
        except Exception as e:
            print(f"Falha ao atualizar post #{post.id}: {e}")

    session.commit()
    session.close()

    first_slot = scheduled_posts[0][1]
    print(f"\n{updated} posts pendentes atualizados.")
    print(
        "Nova agenda recomposta com no maximo 1 post por dia "
        f"a partir de {first_slot.strftime('%Y-%m-%d %H:%M')}."
    )
    if day_interval > 1:
        print(f"Espacamento aplicado: {day_interval} dia(s) entre posts.")


def rebalance_pending_posts(start_at: str | None = None, interval_hours: int = 24):
    """Redistribui posts pendentes para no máximo um post por dia."""
    session = get_session()
    pending_posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at, ScheduledPost.id)
        .all()
    )

    if not pending_posts:
        print("Nenhum post pendente para reagendar.")
        session.close()
        return

    try:
        scheduled_posts, _ = _build_pending_daily_schedule(
            session=session,
            posts=pending_posts,
            start_at=start_at,
            interval_hours=interval_hours,
        )
    except ValueError as exc:
        print(str(exc))
        session.close()
        return

    changes = 0
    for post, slot_dt in scheduled_posts:
        if post.scheduled_at != slot_dt:
            changes += 1
        post.scheduled_at = slot_dt

    session.commit()
    session.close()
    print(f"Fila pendente rebalanceada em {len(scheduled_posts)} slots.")
    if interval_hours < 24:
        print("Intervalos menores que 24h foram ajustados para preservar no maximo 1 post por dia.")
    elif interval_hours == 24:
        print("Agenda comprimida para no maximo 1 post por dia.")
    else:
        day_interval = max(1, (interval_hours + 23) // 24)
        print(f"Agenda recomposta com espacamento de {day_interval} dia(s) entre posts.")
    print(f"Posts movidos para outro horario: {changes}")


def generate_market_news_post(start_at: str | None = None):
    """Coleta noticias de mercado e cria um post mensal noticia_mercado."""
    from content_generator import generate_monthly_market_news_post, save_posts_to_queue

    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    target_date = None
    if start_at:
        try:
            target_date = datetime.strptime(start_at, "%Y-%m-%d %H:%M").replace(tzinfo=tz)
        except ValueError:
            print("Formato invalido para --start-at. Use: YYYY-MM-DD HH:MM")
            return

    print("Coletando noticias/resultados recentes de mercado eletrificado...")
    post = generate_monthly_market_news_post(target_date=target_date)
    count = save_posts_to_queue([post])
    print(f"Post noticia_mercado criado e salvo na fila: {count}")


def repost_with_new_image(post_id: int, start_at: str | None = None):
    """Clona um post existente com nova imagem para republicacao manual."""
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    if start_at:
        try:
            scheduled_at = datetime.strptime(start_at, "%Y-%m-%d %H:%M").replace(tzinfo=tz)
        except ValueError:
            print("Formato invalido para --start-at. Use: YYYY-MM-DD HH:MM")
            return
    else:
        scheduled_at = datetime.now(tz).replace(second=0, microsecond=0) + timedelta(hours=1)

    session = get_session()
    original = session.query(ScheduledPost).filter_by(id=post_id).first()
    if not original:
        print(f"Post #{post_id} nao encontrado.")
        session.close()
        return

    original_headline = _caption_headline(original.caption)
    existing_repost = None
    if original_headline:
        manual_reposts = (
            session.query(ScheduledPost)
            .filter(ScheduledPost.category == "manual_repost")
            .order_by(ScheduledPost.scheduled_at.desc(), ScheduledPost.id.desc())
            .all()
        )
        existing_repost = next(
            (post for post in manual_reposts if _caption_headline(post.caption) == original_headline),
            None,
        )

    if existing_repost:
        status = "publicado" if existing_repost.published else "pendente"
        scheduled = existing_repost.scheduled_at.strftime("%Y-%m-%d %H:%M") if existing_repost.scheduled_at else "N/A"
        print(
            f"Repost bloqueado: ja existe manual_repost #{existing_repost.id} "
            f"({status}, {scheduled}) com a mesma chamada."
        )
        session.close()
        return

    try:
        image_path, image_url, image_cost_meta = generate_and_host_post_image(
            caption=original.caption,
            category=original.category or "geral",
            subtitle="",
            generation_source="manual_repost",
            return_metadata=True,
        )
        repost = ScheduledPost(
            caption=original.caption,
            hashtags=original.hashtags or "",
            image_url=image_url,
            image_path=image_path,
            scheduled_at=scheduled_at,
            category="manual_repost",
            post_type=original.post_type or "image",
        )
        apply_cost_metadata(repost, merge_cost_metadata(image_meta=image_cost_meta))
        session.add(repost)
        session.commit()
        print(f"Repost criado a partir do post #{post_id}: novo post #{repost.id}")
        print(f"Agendado para: {scheduled_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"Imagem: {image_url}")
    except Exception as e:
        session.rollback()
        print(f"Falha ao criar repost do post #{post_id}: {e}")
    finally:
        session.close()


def show_stats():
    session = get_session()

    total = session.query(ScheduledPost).count()
    published = session.query(ScheduledPost).filter_by(published=True).count()
    pending = session.query(ScheduledPost).filter_by(published=False).count()
    with_image = session.query(ScheduledPost).filter(
        ScheduledPost.published == False,
        ScheduledPost.image_url != None,
    ).count()
    without_image = pending - with_image

    print(f"""
📊 Estatísticas da fila
{'─' * 30}
Total de posts:       {total}
Publicados:           {published} ✅
Pendentes:            {pending} ⏳
  Com imagem:         {with_image} 🖼️
  Sem imagem:         {without_image} ❌
{'─' * 30}
""")

    # Próximos 5 posts
    next_posts = (
        session.query(ScheduledPost)
        .filter_by(published=False)
        .order_by(ScheduledPost.scheduled_at)
        .limit(5)
        .all()
    )

    if next_posts:
        print("📅 Próximos posts:")
        for p in next_posts:
            ready = "✅" if p.image_url else "⚠️ sem imagem"
            print(f"   #{p.id} [{p.category}] {p.scheduled_at.strftime('%d/%m %H:%M')} — {ready}")

    session.close()


def show_costs():
    session = get_session()
    settings = get_settings()
    fx_rate = settings.cost_fx_brl

    events = (
        session.query(GenerationEvent)
        .filter(GenerationEvent.estimated_cost_usd != None)
        .order_by(GenerationEvent.created_at.desc())
        .all()
    )

    posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.total_cost_usd != None)
        .order_by(ScheduledPost.created_at.desc())
        .all()
    )

    if not posts and not events:
        print("💸 Nenhum custo estimado registrado ainda.")
        session.close()
        return

    if events:
        total_event_usd = sum(event.estimated_cost_usd or 0 for event in events)
        total_event_brl = usd_to_brl(total_event_usd, fx_rate)
        success_events = [event for event in events if event.status == "success"]
        failed_events = [event for event in events if event.status != "success"]

        print(f"""
💸 Custos estimados por evento de geracao
{'─' * 40}
Eventos com custo registrado:  {len(events)}
Total estimado USD:            ${total_event_usd:.4f}
Total estimado BRL:            R$ {total_event_brl:.2f}
Eventos com sucesso:           {len(success_events)}
Eventos com falha:             {len(failed_events)}
FX usado (estimado):           {fx_rate:.2f}
{'─' * 40}
""")

        event_models: dict[str, float] = {}
        for event in events:
            key = f"{event.event_type}:{event.model or 'desconhecido'}"
            event_models[key] = event_models.get(key, 0.0) + (event.estimated_cost_usd or 0.0)
        print("🧠 Custos por modelo/evento:")
        for model_key, usd_total in sorted(event_models.items(), key=lambda item: item[1], reverse=True):
            print(f"   {model_key:<42} ${usd_total:.4f} / R$ {usd_to_brl(usd_total, fx_rate):.2f}")

        event_sources: dict[str, float] = {}
        for event in events:
            key = event.source or "unknown"
            event_sources[key] = event_sources.get(key, 0.0) + (event.estimated_cost_usd or 0.0)
        print("\n🛠️ Custos por origem:")
        for source, usd_total in sorted(event_sources.items(), key=lambda item: item[1], reverse=True):
            print(f"   {source:<30} ${usd_total:.4f} / R$ {usd_to_brl(usd_total, fx_rate):.2f}")
        print()

    total_usd = sum(post.total_cost_usd or 0 for post in posts)
    avg_usd = total_usd / len(posts) if posts else 0.0
    total_brl = usd_to_brl(total_usd, fx_rate) or 0.0
    avg_brl = usd_to_brl(avg_usd, fx_rate) or 0.0

    print(f"""
💸 Custos estimados por post salvo
{'─' * 36}
Posts com custo registrado: {len(posts)}
Total estimado USD:         ${total_usd:.4f}
Total estimado BRL:         R$ {total_brl:.2f}
Media por post USD:         ${avg_usd:.4f}
Media por post BRL:         R$ {avg_brl:.2f}
FX usado (estimado):        {fx_rate:.2f}
{'─' * 36}
""")

    by_category: dict[str, list[ScheduledPost]] = {}
    for post in posts:
        by_category.setdefault(post.category or "geral", []).append(post)

    print("📊 Media por categoria:")
    for category, items in sorted(by_category.items()):
        category_total = sum(item.total_cost_usd or 0 for item in items)
        category_avg = category_total / len(items)
        print(
            f"   {category:<18} "
            f"{len(items):>3} posts  "
            f"media ${category_avg:.4f} / R$ {usd_to_brl(category_avg, fx_rate):.2f}"
        )

    image_models: dict[str, float] = {}
    for post in posts:
        if not post.image_model:
            continue
        image_models[post.image_model] = image_models.get(post.image_model, 0.0) + (post.image_cost_usd or 0.0)

    if image_models:
        print("\n🧠 Modelos de imagem que mais pesaram:")
        for model, usd_total in sorted(image_models.items(), key=lambda item: item[1], reverse=True):
            print(f"   {model:<35} ${usd_total:.4f} / R$ {usd_to_brl(usd_total, fx_rate):.2f}")

    text_models: dict[str, float] = {}
    for post in posts:
        if not post.text_model:
            continue
        text_models[post.text_model] = text_models.get(post.text_model, 0.0) + (post.text_cost_usd or 0.0)

    if text_models:
        print("\n✍️ Modelos de texto:")
        for model, usd_total in sorted(text_models.items(), key=lambda item: item[1], reverse=True):
            print(f"   {model:<35} ${usd_total:.4f} / R$ {usd_to_brl(usd_total, fx_rate):.2f}")

    if posts:
        print("\n🗂️ Ultimos posts com custo:")
        for post in posts[:10]:
            print(
                f"   #{post.id:<3} [{post.category}] "
                f"total ${post.total_cost_usd or 0:.4f} / R$ {usd_to_brl(post.total_cost_usd or 0, fx_rate):.2f} "
                f"(texto ${post.text_cost_usd or 0:.4f}, imagem ${post.image_cost_usd or 0:.4f})"
            )

    session.close()


def backfill_costs(overwrite: bool = False):
    """Preenche custos estimados para posts antigos sem telemetria salva."""
    from analytics import get_cta_url
    from content_generator import CONTENT_CATEGORIES, _build_generation_prompt

    session = get_session()
    settings = get_settings()
    posts = (
        session.query(ScheduledPost)
        .order_by(ScheduledPost.created_at, ScheduledPost.id)
        .all()
    )

    updated = 0
    for post in posts:
        if not overwrite and post.total_cost_usd is not None:
            continue

        cat_info = next((c for c in CONTENT_CATEGORIES if c["id"] == (post.category or "")), None)
        cat_desc = cat_info["description"] if cat_info else (post.category or "geral")
        source_vehicles = _find_matching_vehicles(post.caption or "", limit=2)
        prompt = _build_generation_prompt(
            category=post.category or "geral",
            category_desc=cat_desc,
            cta_url=get_cta_url(category=post.category or "geral", post_id=post.id),
            source_vehicles=source_vehicles,
        )

        output_text = "\n".join(part for part in [post.caption or "", post.hashtags or ""] if part).strip()
        input_tokens = rough_token_estimate(prompt)
        output_tokens = rough_token_estimate(output_text)
        text_meta = {
            "text_provider": post.text_provider or "gemini",
            "text_model": post.text_model or settings.gemini_model,
            "text_input_tokens": input_tokens,
            "text_output_tokens": output_tokens,
            "text_total_tokens": input_tokens + output_tokens,
            "text_cost_source": "backfill_estimate",
            "text_cost_usd": estimate_text_cost_usd(
                model=post.text_model or settings.gemini_model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            ),
        }

        existing_image_model = post.image_model
        existing_image_provider = post.image_provider
        existing_image_cost = post.image_cost_usd
        existing_ai_used = post.ai_image_used

        if existing_image_model is None and existing_image_cost is None:
            ai_image_used = False
            provider = "local"
            model = "template_or_catalog"
            if (post.category or "geral") in AI_IMAGE_CATEGORIES:
                if post.category == "tco_insight" and source_vehicles:
                    ai_image_used = False
                    provider = "catalog"
                    model = "catalog_or_vehicle_photo"
                else:
                    ai_image_used = True
                    provider = (settings.image_generation_provider or "gemini").strip().lower()
                    model = settings.image_generation_model
            image_meta = build_image_cost_metadata(
                provider=provider,
                model=model,
                ai_image_used=ai_image_used,
            )
            image_meta["image_cost_source"] = "backfill_estimate" if ai_image_used else "backfill_zero_cost"
        else:
            image_meta = {
                "image_provider": existing_image_provider,
                "image_model": existing_image_model,
                "ai_image_used": existing_ai_used,
                "image_cost_source": post.image_cost_source,
                "image_cost_usd": existing_image_cost,
            }

        apply_cost_metadata(post, merge_cost_metadata(text_meta=text_meta, image_meta=image_meta))
        updated += 1

    session.commit()
    session.close()
    print(f"💸 Custos estimados preenchidos para {updated} posts.")


def preview_post(post_id: int):
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        session.close()
        return

    print(f"👀 Preview do post #{post.id}")
    print(f"   Categoria: {post.category}")
    print(f"   Agendado: {post.scheduled_at}")
    print(f"   Imagem: {post.image_url or 'sem imagem'}")
    print(f"   URL preview: {build_preview_url(post.id)}")
    session.close()


def main():
    parser = argparse.ArgumentParser(description="Gerenciar fila de publicação PBEV")
    parser.add_argument("--list", action="store_true", help="Listar posts")
    parser.add_argument("--all", action="store_true", help="Incluir publicados (com --list)")
    parser.add_argument("--delete", type=int, metavar="ID", help="Remover post por ID")
    parser.add_argument("--reschedule", nargs=2, metavar=("ID", "DATETIME"),
                        help="Reagendar post: ID 'YYYY-MM-DD HH:MM'")
    parser.add_argument("--add-image", nargs=2, metavar=("ID", "URL"),
                        help="Adicionar URL de imagem a um post")
    parser.add_argument("--generate-images", action="store_true",
                        help="Gerar imagens para posts pendentes sem imagem")
    parser.add_argument("--reset-post", type=int, metavar="ID",
                        help="Regenerar um post pendente específico")
    parser.add_argument("--repost", type=int, metavar="ID",
                        help="Clonar um post existente com nova imagem e agendar como manual_repost")
    parser.add_argument("--topic", type=str,
                        help="Tema explícito para usar com --reset-post")
    parser.add_argument("--reset-grounded-posts", action="store_true",
                        help="Regenerar posts pendentes de modelo_destaque, comparativo e tco_insight")
    parser.add_argument("--refresh-pending", action="store_true",
                        help="Regenerar todos os posts pendentes e reagendar com no maximo 1 post por dia")
    parser.add_argument("--rebalance-pending", action="store_true",
                        help="Redistribuir posts pendentes sem regenerar conteudo")
    parser.add_argument("--generate-market-news", action="store_true",
                        help="Coletar noticias/resultados de mercado e criar um post noticia_mercado")
    parser.add_argument("--start-at", type=str,
                        help="Data inicial para --refresh-pending ou --rebalance-pending: 'YYYY-MM-DD HH:MM'")
    parser.add_argument("--interval-hours", type=int, default=24,
                        help="Espacamento minimo em horas para --refresh-pending ou --rebalance-pending; valores <24 viram 1 post/dia")
    parser.add_argument("--stats", action="store_true", help="Mostrar estatísticas")
    parser.add_argument("--costs", action="store_true", help="Mostrar custos estimados de geração")
    parser.add_argument("--backfill-costs", action="store_true", help="Preencher custo estimado de posts antigos")
    parser.add_argument("--preview", type=int, metavar="ID", help="Mostrar URL de preview do post")

    args = parser.parse_args()
    init_db()

    if args.list:
        list_posts(show_all=args.all)
    elif args.delete:
        delete_post(args.delete)
    elif args.reschedule:
        reschedule_post(int(args.reschedule[0]), args.reschedule[1])
    elif args.add_image:
        add_image_to_post(int(args.add_image[0]), args.add_image[1])
    elif args.generate_images:
        generate_missing_images()
    elif args.reset_post:
        reset_post(args.reset_post, topic_override=args.topic)
    elif args.repost:
        repost_with_new_image(args.repost, start_at=args.start_at)
    elif args.reset_grounded_posts:
        reset_grounded_posts()
    elif args.refresh_pending:
        refresh_pending_posts(start_at=args.start_at, interval_hours=args.interval_hours)
    elif args.rebalance_pending:
        rebalance_pending_posts(start_at=args.start_at, interval_hours=args.interval_hours)
    elif args.generate_market_news:
        generate_market_news_post(start_at=args.start_at)
    elif args.stats:
        show_stats()
    elif args.costs:
        show_costs()
    elif args.backfill_costs:
        backfill_costs()
    elif args.preview:
        preview_post(args.preview)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
