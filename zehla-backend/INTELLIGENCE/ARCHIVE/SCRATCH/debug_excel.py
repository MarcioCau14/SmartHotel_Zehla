import pandas as pd

file_path = '/Users/marciocau/Downloads/ENTREGÁVEIS ZEHLA FULL STACK/ZEHLA_Plano_Master_V2_Fórmulas.xlsx'

# Ler sem cabeçalho para ver a estrutura real (pode haver linhas vazias no topo)
print("--- ESTRUTURA REAL DA ABA: Calculadora de ROI ---")
df_full = pd.read_excel(file_path, sheet_name='Calculadora de ROI', header=None)
print(df_full.head(15))

print("\n--- ESTRUTURA REAL DA ABA: Cronograma 2026 ---")
df_cron_full = pd.read_excel(file_path, sheet_name='Cronograma 2026', header=None)
print(df_cron_full.head(15))
