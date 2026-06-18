import pandas as pd
import os

csv_path = '/Users/marciocau/secretaria-ai/backend/outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.csv'
output_path = '/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx'

if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    df.to_excel(output_path, index=False)
    print(f"Exported successfully to {output_path}")
else:
    print(f"Error: {csv_path} not found.")
