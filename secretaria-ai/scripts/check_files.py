import os
import pandas as pd
import glob
import json

paths = [
    "./backend/outbox/*",
    "./backend/data/*",
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx",
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA_ENRICHED.xlsx",
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA_ENRICHED_FINAL.xlsx",
    "/Users/marciocau/Downloads/PLANILHA_LEADS_COMPLETA_ENRIQUECIDA.xlsx",
    "/Users/marciocau/Downloads/SECRETARIA.AI — RELATÓRIO DE SINCRONIZAÇÃO FRONT-END ↔ BACK-END.md",
    "/Users/marciocau/Downloads/secretaria_validacao_completa.csv"
]

print("Searching files for yahoo.com.br...")
for filepath in paths:
    # Expand glob if any
    for fp in glob.glob(filepath):
        if os.path.isdir(fp):
            continue
        try:
            if fp.endswith('.csv'):
                # Try with different separators
                for sep in [';', ',', '\t']:
                    try:
                        df = pd.read_csv(fp, sep=sep)
                        for col in df.columns:
                            matches = df[df[col].astype(str).str.contains('yahoo.com.br', case=False, na=False)]
                            if not matches.empty:
                                print(f"Found in CSV {fp} (sep='{sep}'), column {col}:")
                                for idx, row in matches.iterrows():
                                    print(f"  Row {idx}: {dict(row)}")
                        break
                    except Exception as e:
                        pass
            elif fp.endswith('.xlsx') or fp.endswith('.xls'):
                xls = pd.ExcelFile(fp)
                for sheet_name in xls.sheet_names:
                    df = pd.read_excel(fp, sheet_name=sheet_name)
                    for col in df.columns:
                        matches = df[df[col].astype(str).str.contains('yahoo.com.br', case=False, na=False)]
                        if not matches.empty:
                            print(f"Found in XLSX {fp} [Sheet: {sheet_name}], column {col}:")
                            for idx, row in matches.iterrows():
                                print(f"  Row {idx}: {dict(row)}")
            elif fp.endswith('.json'):
                with open(fp, 'r') as f:
                    data = json.load(f)
                    content_str = json.dumps(data)
                    if 'yahoo.com.br' in content_str.lower():
                        print(f"Found in JSON {fp}")
            elif fp.endswith('.txt') or fp.endswith('.md'):
                with open(fp, 'r') as f:
                    content = f.read()
                    if 'yahoo.com.br' in content.lower():
                        print(f"Found in text file {fp}")
        except Exception as e:
            print(f"Error reading {fp}: {e}")
