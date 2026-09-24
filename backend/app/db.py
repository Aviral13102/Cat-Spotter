import aiosqlite
from app.config import settings
import json

class Database:
    def __init__(self):
        self.db_path = settings.PROJECT_ROOT / settings.DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''CREATE TABLE IF NOT EXISTS incidents (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, description TEXT)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS idle_reasons (id INTEGER PRIMARY KEY AUTOINCREMENT, reason TEXT)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS training_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT, module TEXT, reason TEXT)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS streaks (id INTEGER PRIMARY KEY AUTOINCREMENT, points INTEGER)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, score INTEGER)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS badges (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)''')
            await db.execute('''CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT, slot TEXT)''')
            await db.commit()

    async def add_incident(self, type: str, description: str):
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute('INSERT INTO incidents (type, description) VALUES (?, ?)', (type, description))
            await db.commit()
            return cursor.lastrowid
            
    async def get_incidents(self):
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute('SELECT id, type, description FROM incidents') as cursor:
                return [{"id": row[0], "type": row[1], "description": row[2]} for row in await cursor.fetchall()]

db = Database()
