import pandas as pd

file_path = '/Users/marciocau/Downloads/ENTREGÁVEIS ZEHLA FULL STACK/ZEHLA_Plano_Master_V2_Fórmulas.xlsx'

print("--- DETALHE: Calculadora de ROI ---")
df_roi = pd.read_excel(file_path, sheet_name='Calculadora de ROI')
# Mostrando as linhas 5 a 10 que parecem conter os dados de Mix
print(df_roi.iloc[4:15])

print("\n--- DETALHE: Cronograma 2026 ---")
df_cron = pd.read_excel(file_path, sheet_name='Cronograma 2026')
print(df_cron.iloc[0:30])
