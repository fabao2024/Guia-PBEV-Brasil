"""Helpers to distribute categories and datetimes across scheduled slots."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from typing import Mapping, Sequence

from ev_knowledge import OPTIMAL_POSTING_HOURS

DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def assign_categories_to_slots(
    slot_datetimes: Sequence[datetime],
    categories: Sequence[str],
    blocked_categories_by_day: Mapping[date, set[str]] | None = None,
) -> list[str]:
    """Assign categories to slots avoiding same-day duplicates when possible."""
    if len(slot_datetimes) != len(categories):
        raise ValueError("slot_datetimes and categories must have the same length")

    remaining = Counter(category or "geral" for category in categories)
    first_seen_index: dict[str, int] = {}
    normalized_categories = []
    for index, category in enumerate(categories):
        category = category or "geral"
        normalized_categories.append(category)
        first_seen_index.setdefault(category, index)

    blocked_by_day = {
        day: {category or "geral" for category in blocked_categories}
        for day, blocked_categories in (blocked_categories_by_day or {}).items()
    }

    slots_by_day: dict[date, list[int]] = defaultdict(list)
    for index, slot_dt in enumerate(slot_datetimes):
        slots_by_day[slot_dt.date()].append(index)

    result = ["" for _ in slot_datetimes]
    for day in sorted(slots_by_day):
        used_today: set[str] = set()
        blocked_today = set(blocked_by_day.get(day, set()))

        for slot_index in slots_by_day[day]:
            category = _pick_category(
                remaining,
                first_seen_index,
                disallowed=blocked_today | used_today,
                preferred=normalized_categories[slot_index],
            )
            if category is None:
                category = _pick_category(
                    remaining,
                    first_seen_index,
                    disallowed=used_today,
                    preferred=normalized_categories[slot_index],
                )
            if category is None:
                category = _pick_category(
                    remaining,
                    first_seen_index,
                    disallowed=set(),
                    preferred=normalized_categories[slot_index],
                )
            if category is None:
                raise ValueError("Unable to assign categories to all slots")

            result[slot_index] = category
            remaining[category] -= 1
            if remaining[category] <= 0:
                del remaining[category]
            used_today.add(category)

    if remaining:
        raise ValueError("Category assignment left unallocated items")

    return result


def _pick_category(
    remaining: Counter,
    first_seen_index: Mapping[str, int],
    disallowed: set[str],
    preferred: str | None = None,
) -> str | None:
    candidates = [category for category in remaining if category not in disallowed]
    if not candidates:
        return None

    candidates.sort(
        key=lambda category: (
            0 if category == preferred else 1,
            -remaining[category],
            first_seen_index.get(category, 10**9),
            category,
        )
    )
    return candidates[0]


def get_preferred_posting_hour(target_date: date | datetime, fallback_hour: int = 9) -> int:
    """Return the first configured posting hour for the given day."""
    current_date = target_date.date() if isinstance(target_date, datetime) else target_date
    day_name = DAY_NAMES[current_date.weekday()]
    day_config = next((item for item in OPTIMAL_POSTING_HOURS if item["day"] == day_name), None)
    hours = list((day_config or {}).get("hours") or [])
    return int(hours[0]) if hours else fallback_hour


def build_daily_slot_datetimes(
    start_dt: datetime,
    total_slots: int,
    occupied_dates: set[date] | None = None,
    preserve_start_time_for_first_slot: bool = False,
    day_interval: int = 1,
) -> list[datetime]:
    """Build slots with at most one post per day, skipping occupied dates."""
    if total_slots < 0:
        raise ValueError("total_slots must be >= 0")
    if day_interval < 1:
        raise ValueError("day_interval must be >= 1")

    blocked_dates = set(occupied_dates or set())
    slots: list[datetime] = []
    current_date = start_dt.date()

    while len(slots) < total_slots:
        if current_date in blocked_dates:
            current_date += timedelta(days=1)
            continue

        if not slots and preserve_start_time_for_first_slot:
            slot_dt = start_dt.replace(
                year=current_date.year,
                month=current_date.month,
                day=current_date.day,
                second=0,
                microsecond=0,
            )
        else:
            slot_dt = start_dt.replace(
                year=current_date.year,
                month=current_date.month,
                day=current_date.day,
                hour=get_preferred_posting_hour(current_date, fallback_hour=start_dt.hour),
                minute=0,
                second=0,
                microsecond=0,
            )

        if slot_dt < start_dt:
            current_date += timedelta(days=1)
            continue

        slots.append(slot_dt)
        blocked_dates.add(current_date)
        current_date += timedelta(days=day_interval)

    return slots
