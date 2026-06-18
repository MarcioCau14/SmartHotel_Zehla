import os
import pandas as pd
import glob

files = [
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx",
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA_ENRICHED.xlsx",
    "/Users/marciocau/Downloads/LEADS_POUSADAS_PRAIA_DO_ROSA_ENRICHED_FINAL.xlsx",
    "/Users/marciocau/Downloads/PLANILHA_LEADS_COMPLETA_ENRIQUECIDA.xlsx",
    "/Users/marciocau/Downloads/SECRETARIA.AI — RELATÓRIO DE SINCRONIZAÇÃO FRONT-END ↔ BACK-END.md",
    "/Users/marciocau/Downloads/secretaria_validacao_completa.csv"
]

print("Searching Downloads files for 'ipad' or 'air'...")
for f in files:
    if not os.path.exists(f):
        continue
    try:
        if f.endswith('.csv'):
            for sep in [';', ',', '\t']:
                try:
                    df = pd.read_csv(f, sep=sep)
                    for col in df.columns:
                        matches = df[df[col].astype(str).str.contains('ipad|air', case=False, na=False)]
                        if not matches.empty:
                            print(f"Found in CSV {f}:")
                            print(matches[[col]].to_string())
                    break
                except:
                    pass
        elif f.endswith('.xlsx'):
            xls = pd.ExcelFile(f)
            for sheet in xls.sheet_names:
                df = pd.read_excel(f, sheet_name=sheet)
                for col in df.columns:
                    matches = df[df[col].astype(str).str.contains('ipad|air', case=False, na=False)]
                    if not matches.empty:
                        print(f"Found in XLSX {f} [Sheet: {sheet}]:")
                        print(matches[[col]].to_string())
        elif f.endswith('.md'):
            with open(f, 'r') as file:
                content = file.read()
                if 'ipad' in content.lower() or 'air' in content.lower():
                    print(f"Found in MD {f}")
    except Exception as e:
        print(f"Error {f}: {e}")
