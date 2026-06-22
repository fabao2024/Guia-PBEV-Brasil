from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from config import get_settings
from content_generator import generate_single_post, save_posts_to_queue, sync_vehicle_catalog
from database import get_session, ScheduledPost
from schedule_utils import get_preferred_posting_hour


def main():
    settings = get_settings()
    tz = ZoneInfo(settings.posting_timezone)
    start_date = datetime(2026, 6, 3, 0, 0, tzinfo=tz).date()
    end_date = datetime(2026, 6, 30, 23, 59, tzinfo=tz).date()
    categories = ["modelo_destaque", "comparativo", "dica_ev", "tco_insight"]

    session = get_session()
    occupied = {
        post.scheduled_at.date()
        for post in session.query(ScheduledPost)
        .filter(ScheduledPost.scheduled_at != None)
        .all()
        if post.scheduled_at
        and post.scheduled_at.year == 2026
        and post.scheduled_at.month == 6
    }
    session.close()

    slots = []
    current = start_date
    while current <= end_date:
        if current not in occupied:
            hour = get_preferred_posting_hour(current, fallback_hour=9)
            slots.append(datetime(2026, 6, current.day, hour, 0, tzinfo=tz))
        current += timedelta(days=1)

    print(f"slots_to_fill={len(slots)}")
    if not slots:
        return

    sync_vehicle_catalog()
    created = []
    for index, slot_dt in enumerate(slots):
        category = categories[index % len(categories)]
        print(f"generating {slot_dt.isoformat()} [{category}]", flush=True)
        post = generate_single_post(
            category=category,
            sync_catalog_first=False,
            generation_source="june_month_fill_vps",
        )
        post["scheduled_at"] = slot_dt.isoformat()
        saved = save_posts_to_queue([post])
        headline = post["caption"].splitlines()[0]
        created.append((slot_dt, category, saved, headline))
        print(f"saved={saved} headline={headline[:100]}", flush=True)

    print("created_summary")
    for slot_dt, category, saved, headline in created:
        print(f"{slot_dt:%Y-%m-%d %H:%M} {category} saved={saved} {headline[:100]}")


if __name__ == "__main__":
    main()
