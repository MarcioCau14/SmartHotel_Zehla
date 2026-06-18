import sqlite3

db = "./prisma/db/secretaria.db"
conn = sqlite3.connect(db)
cursor = conn.cursor()
cursor.execute("SELECT * FROM leads WHERE isCanary = 1 OR isCanary = True;")
res = cursor.fetchall()
print("Canary rows count:", len(res))
if res:
    cursor.execute("PRAGMA table_info(leads);")
    cols = [c[1] for c in cursor.fetchall()]
    for r in res:
        print(dict(zip(cols, r)))
else:
    print("No canary rows found.")
conn.close()
