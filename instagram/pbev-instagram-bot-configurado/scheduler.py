"""APScheduler configuration for automated post publishing."""

import logging
from datetime import datetime, timedelta
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from config import get_settings
from database import get_session, ScheduledPost
from publisher import InstagramPublisher

logger = logging.getLogger(__name__)

MAX_PUBLISH_ATTEMPTS = 3


def _caption_headline(text: str | None) -> str:
    return (text or "").splitlines()[0].strip().lower()


def _find_recent_duplicate(session, post: ScheduledPost, now: datetime, hours: int = 24) -> ScheduledPost | None:
    cutoff = now - timedelta(hours=hours)
    recent_posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == True,
            ScheduledPost.published_at != None,
            ScheduledPost.published_at >= cutoff,
        )
        .all()
    )

    current_headline = _caption_headline(post.caption)
    for recent in recent_posts:
        same_image = bool(post.image_url) and post.image_url == recent.image_url
        same_headline = current_headline and current_headline == _caption_headline(recent.caption)
        if same_image or same_headline:
            return recent
    return None


def _get_pending_queue_summary() -> tuple[int, datetime | None, datetime | None]:
    session = get_session()
    pending_posts = (
        session.query(ScheduledPost)
        .filter(ScheduledPost.published == False)
        .order_by(ScheduledPost.scheduled_at, ScheduledPost.id)
        .all()
    )
    session.close()

    if not pending_posts:
        return 0, None, None

    scheduled_dates = [post.scheduled_at for post in pending_posts if post.scheduled_at is not None]
    first_pending = scheduled_dates[0] if scheduled_dates else None
    last_pending = scheduled_dates[-1] if scheduled_dates else None
    return len(pending_posts), first_pending, last_pending


async def publish_due_posts():
    """Verifica e publica posts que estão na hora."""
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    now = datetime.now(tz)

    session = get_session()
    due_posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == False,
            ScheduledPost.scheduled_at <= now,
            ScheduledPost.image_url != None,  # Só publica se tiver imagem
            ScheduledPost.failed_count < MAX_PUBLISH_ATTEMPTS,
        )
        .order_by(ScheduledPost.scheduled_at)
        .limit(3)  # Máximo 3 por ciclo (rate limiting)
        .all()
    )

    if not due_posts:
        logger.debug("📭 Nenhum post pendente para publicação.")
        session.close()
        return

    publisher = InstagramPublisher()

    for post in due_posts:
        try:
            duplicate = _find_recent_duplicate(session, post, now)
            if duplicate:
                post.published = True
                post.published_at = now
                post.ig_media_id = f"duplicate_of_{duplicate.id}"
                logger.warning(
                    f"⚠️ Post {post.id} marcado como duplicado do post {duplicate.id}; pulando publicação."
                )
                session.commit()
                continue

            result = await publisher.publish_image_post(
                image_url=post.image_url,
                caption=post.caption,
                hashtags=post.hashtags,
            )
            post.published = True
            post.published_at = now
            post.ig_media_id = result.get("media_id")
            logger.info(f"✅ Post {post.id} publicado: {result['media_id']}")
            session.commit()

        except Exception as e:
            post.failed_count = (post.failed_count or 0) + 1
            post.last_error = str(e)[:1000]
            post.last_attempt_at = now
            logger.error(
                "❌ Falha ao publicar post %s [%s] tentativa=%s/%s host=%s caption_len=%s: %s",
                post.id,
                post.category,
                post.failed_count,
                MAX_PUBLISH_ATTEMPTS,
                urlparse(post.image_url or "").netloc or "-",
                len((post.caption or "") + (post.hashtags or "")),
                e,
            )
            if post.failed_count >= MAX_PUBLISH_ATTEMPTS:
                logger.warning(
                    "⛔ Post %s desistido após %s tentativas; não será mais reprocessado até reset manual.",
                    post.id,
                    post.failed_count,
                )
            session.commit()

    session.close()


async def generate_weekly_content_job():
    """Job semanal para gerar conteúdo da próxima semana."""
    from content_generator import generate_weekly_content, save_posts_to_queue

    logger.info("🗓️ Gerando conteúdo semanal...")
    try:
        posts = generate_weekly_content()
        count = save_posts_to_queue(posts)
        logger.info(f"✅ {count} posts gerados e agendados para a semana.")
    except Exception as e:
        logger.error(f"❌ Erro ao gerar conteúdo semanal: {e}")


async def generate_weekly_content_job_if_queue_empty():
    pending_count, first_pending, last_pending = _get_pending_queue_summary()
    if pending_count:
        logger.warning(
            "âš ï¸ Geracao semanal ignorada: existem %s posts pendentes na fila (primeiro=%s, ultimo=%s).",
            pending_count,
            first_pending,
            last_pending,
        )
        return

    await generate_weekly_content_job()


def _has_market_news_post_for_month(now: datetime) -> bool:
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 12:
        next_month = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        next_month = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)

    session = get_session()
    exists = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.category == "noticia_mercado",
            ScheduledPost.scheduled_at >= month_start,
            ScheduledPost.scheduled_at < next_month,
        )
        .first()
        is not None
    )
    session.close()
    return exists


async def generate_monthly_market_news_job():
    """Generate one monthly market-news post grounded in recent scraped sources."""
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    now = datetime.now(tz)
    if _has_market_news_post_for_month(now):
        logger.info("Post mensal noticia_mercado ja existe para %s/%s; pulando.", now.month, now.year)
        return

    from content_generator import generate_monthly_market_news_post, save_posts_to_queue

    logger.info("Gerando post mensal noticia_mercado com fontes recentes...")
    try:
        post = generate_monthly_market_news_post(target_date=now.replace(hour=10, minute=0, second=0, microsecond=0))
        count = save_posts_to_queue([post])
        logger.info("Post mensal noticia_mercado salvo na fila: %s", count)
    except Exception as e:
        logger.error("Erro ao gerar post mensal noticia_mercado: %s", e)


def create_scheduler() -> AsyncIOScheduler:
    """Cria e configura o scheduler."""
    settings = get_settings()
    scheduler = AsyncIOScheduler(timezone=settings.posting_timezone)

    # Verifica posts pendentes a cada 5 minutos
    scheduler.add_job(
        publish_due_posts,
        CronTrigger(minute="*/5"),
        id="publish_due_posts",
        name="Publicar posts agendados",
        replace_existing=True,
    )

    # Gera conteúdo toda segunda às 6h
    scheduler.add_job(
        generate_weekly_content_job_if_queue_empty,
        CronTrigger(day_of_week="mon", hour=6, minute=0),
        id="weekly_content_gen",
        name="Gerar conteúdo semanal",
        replace_existing=True,
    )

    logger.info("⏰ Scheduler configurado: publish a cada 5min, content gen segunda 6h")
    scheduler.add_job(
        generate_monthly_market_news_job,
        CronTrigger(day=8, hour=7, minute=30),
        id="monthly_market_news",
        name="Gerar noticia mensal de mercado",
        replace_existing=True,
    )

    return scheduler
