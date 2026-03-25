"""
Daily cron job: Add availability for day+365 for all approved artists.

Run daily between 0:01 and 6:00.
For each approved artist, ensures that the date 365 days from today is set to available
(unless the artist has manually blocked it).

Can be triggered via:
  - Direct script execution: python cron_jobs/auto_availability.py
  - HTTP endpoint: POST /api/cron/auto-availability (with CRON_SECRET header)
"""

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app, db
from managers.availability_manager import AvailabilityManager
from datetime import date, timedelta

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def run_daily_availability():
    """
    Add the day that is 365 days from now for all approved artists.
    This is the daily rolling window update.
    """
    manager = AvailabilityManager()
    target_date = date.today() + timedelta(days=365)

    result = manager.ensure_available_for_all_on(target_date, only_approved=True)
    logger.info(
        "Daily availability cron: date=%s created=%s skipped=%s",
        result.get("date"), result.get("created"), result.get("skipped")
    )
    return result


if __name__ == "__main__":
    with app.app_context():
        try:
            result = run_daily_availability()
            logger.info("Auto-Availability cron finished: %s", result)
        except Exception as e:
            logger.exception("Auto-Availability cron failed")
            sys.exit(1)
