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
                        # Let's search for any email containing yahoo.com.br
                        query = f"SELECT * FROM {table} WHERE {col} LIKE '%yahoo.com.br%';"
                        cursor.execute(query)
                        res = cursor.fetchall()
                        if res:
                            print(f"    Found in table '{table}', column '{col}':")
                            for r in res:
                                # zip columns and values
                                info = dict(zip(cols, r))
                                print(f"      {info}")
            except Exception as e:
                print(f"  Error inspecting table {table}: {e}")
        conn.close()
    except Exception as e:
        print(f"Error opening {db}: {e}")
