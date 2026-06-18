import sqlite3
import os
import json

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
DB_PATH = os.path.join(DB_DIR, "secretaria.db")

def init_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Leads Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa TEXT,
        decisor TEXT,
        cargo TEXT,
        email TEXT UNIQUE,
        whatsapp TEXT,
        setor TEXT,
        social_media TEXT,
        porte TEXT,
        status TEXT,
        hook TEXT,
        validation_score REAL,
        social_footprint TEXT,
        metadata TEXT
    )
    ''')
    
    # Targets Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        domain TEXT UNIQUE,
        status TEXT
    )
    ''')
    
    # Seed Targets if empty
    cursor.execute('SELECT COUNT(*) FROM targets')
    if cursor.fetchone()[0] == 0:
        targets = [
            ("Riachuelo", "riachuelo.com.br", "active"),
            ("Lojas Renner", "lojasrenner.com.br", "active"),
            ("Vans Brasil", "vans.com.br", "active"),
            ("Oakberry", "oakberry.com", "pending")
        ]
        cursor.executemany('INSERT INTO targets (name, domain, status) VALUES (?, ?, ?)', targets)
    
    conn.commit()
    conn.close()
    print(f"[DB] Database initialized at {DB_PATH}")

def save_lead(lead_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT OR REPLACE INTO leads 
    (empresa, decisor, cargo, email, whatsapp, setor, social_media, porte, status, hook, validation_score, social_footprint, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        lead_data.get("empresa"),
        lead_data.get("decisor"),
        lead_data.get("cargo"),
        lead_data.get("email"),
        lead_data.get("whatsapp"),
        lead_data.get("setor"),
        lead_data.get("social_media"),
        lead_data.get("porte"),
        lead_data.get("status", "pending"),
        lead_data.get("hook"),
        lead_data.get("validation_score", 0.0),
        json.dumps(lead_data.get("social_footprint", {})),
        json.dumps(lead_data.get("metadata", {}))
    ))
    
    conn.commit()
    conn.close()

def get_all_leads():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM leads ORDER BY id DESC')
    rows = cursor.fetchall()
    leads = []
    for row in rows:
        d = dict(row)
        try:
            d["social_footprint"] = json.loads(d["social_footprint"])
            d["metadata"] = json.loads(d["metadata"])
        except:
            d["social_footprint"] = {}
            d["metadata"] = {}
        leads.append(d)
    conn.close()
    return leads

def get_all_targets():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM targets')
    rows = cursor.fetchall()
    targets = [dict(row) for row in rows]
    conn.close()
    return targets

if __name__ == "__main__":
    init_db()
