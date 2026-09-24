"""
CAT Spotter Database Seeder
Seeds the SQLite database with demo data (leaderboard, streaks, initial state).
"""
import asyncio
import json
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.config import settings


async def seed() -> None:
    """Seed the database with demo data."""
    import aiosqlite

    db_path = settings.PROJECT_ROOT / settings.DB_PATH
    print(f"Seeding database at {db_path}...")

    async with aiosqlite.connect(str(db_path)) as db:
        # Load leaderboard seed
        leaderboard_path = settings.CONTENT_DIR / "leaderboard_seed.json"
        if leaderboard_path.exists():
            with open(leaderboard_path) as f:
                data = json.load(f)
            for entry in data["entries"]:
                await db.execute(
                    """INSERT OR REPLACE INTO leaderboard
                       (operator_id, name, points, badges, is_self)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        entry["operator_id"],
                        entry["name"],
                        entry["points"],
                        entry["badges"],
                        entry["is_self"],
                    ),
                )
            print(f"  Seeded {len(data['entries'])} leaderboard entries")

        # Seed safe shift streak (demo history: 6 consecutive safe shifts)
        await db.execute(
            """INSERT OR REPLACE INTO streaks
               (operator_id, safe_hours, safe_shifts, points)
               VALUES (?, ?, ?, ?)""",
            ("OP1001", 0, 6, 0),
        )
        print("  Seeded streak data (6 safe shifts demo history)")

        await db.commit()
    print("✅ Database seeded successfully.")


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
