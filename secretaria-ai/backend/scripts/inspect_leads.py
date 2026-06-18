import pandas as pd
import sys

file_path = "/Users/marciocau/secretaria-ai/backend/outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx"
try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("First 2 rows:")
    print(df.head(2).to_json(orient='records', indent=2))
except Exception as e:
    print(f"Error: {e}")
