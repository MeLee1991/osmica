from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sqlite3

app = FastAPI()

# allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# serve UI
@app.get("/")
def home():
    return FileResponse("index.html")


# -----------------------
# STATIC FILES
# -----------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# -----------------------
# CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# DATABASE
# -----------------------
conn = sqlite3.connect("db.db", check_same_thread=False)
conn.execute("""
CREATE TABLE IF NOT EXISTS bookings (
    key TEXT PRIMARY KEY,
    user TEXT
)
""")

# -----------------------
# ROUTES
# -----------------------
@app.get("/bookings")
def get_bookings():
    rows = conn.execute("SELECT key, user FROM bookings").fetchall()
    return {k: u for k, u in rows}

@app.post("/toggle")
async def toggle(data: dict):
    k = f"{data['date']}_{data['time']}_{data['slot']}"
    user = data["user"]

    row = conn.execute("SELECT user FROM bookings WHERE key=?", (k,)).fetchone()

    if row:
        # only owner can remove
        if row[0] == user:
            conn.execute("DELETE FROM bookings WHERE key=?", (k,))
            conn.commit()
    else:
        conn.execute("INSERT INTO bookings VALUES (?, ?)", (k, user))
        conn.commit()

    return {"ok": True}
