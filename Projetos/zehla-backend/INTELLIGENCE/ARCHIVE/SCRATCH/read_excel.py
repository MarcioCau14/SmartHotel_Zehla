import pandas as pd

file_path = '/Users/marciocau/Downloads/ZEHLA_Plano_Master_V2_Fórmulas.xlsx'

print("--- ABA: Calculadora de ROI ---")
df_roi = pd.read_excel(file_path, sheet_name='Calculadora de ROI')
print(df_roi.head(20))

print("\n--- ABA: Cronograma 2026 ---")
df_cron = pd.read_excel(file_path, sheet_name='Cronograma 2026')
print(df_cron.head(20))
