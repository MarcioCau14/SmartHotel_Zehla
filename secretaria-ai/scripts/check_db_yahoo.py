import sqlite3

dbs = [
    "./prisma/db/secretaria.db",
    "./backend/data/secretaria.db",
    "./db/custom.db"
]

for db in dbs:
    print(f"=== Database: {db} ===")
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in [t[0] for t in tables]:
            try:
                cursor.execute(f"PRAGMA table_info({table});")
                cols = [c[1] for c in cursor.fetchall()]
                email_cols = [c for c in cols if 'email' in c.lower() or 'mail' in c.lower()]
                if email_cols:
                    for col in email_cols:
                        query = f"SELECT {col}, * FROM {table} WHERE {col} LIKE '%yahoo%';"
                        cursor.execute(query)
                        res = cursor.fetchall()
                        if res:
                            print(f"    Found in table '{table}', column '{col}':")
                            for r in res:
                                print(f"      {r[0]}")
            except Exception as e:
                pass
        conn.close()
    except Exception as e:
        print(f"Error opening {db}: {e}")
