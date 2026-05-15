import pandas as pd

# Caminho corrigido com o nome exato do arquivo encontrado na pasta
file_path = '/Users/marciocau/Downloads/ENTREGÁVEIS ZEHLA FULL STACK/ZEHLA_Plano_Master_V2_Fórmulas.xlsx'

print("--- ABA: Calculadora de ROI ---")
df_roi = pd.read_excel(file_path, sheet_name='Calculadora de ROI')
# Selecionar colunas relevantes para a análise solicitada
if 'Mix(%)' in df_roi.columns:
    print(df_roi[['Segmento', 'Mix(%)', 'Conversão Estimada', 'Recuperação Mensal (R$)']].head(10))
else:
    # Se a coluna tiver um nome levemente diferente (ex: com espaços ou acento)
    print("Colunas encontradas:", df_roi.columns.tolist())
    mix_col = [c for c in df_roi.columns if 'Mix' in c][0]
    print(df_roi[['Segmento', mix_col]].head(10))

print("\n--- ABA: Cronograma 2026 ---")
df_cron = pd.read_excel(file_path, sheet_name='Cronograma 2026')
print(df_cron[['Fase', 'Tarefa', 'Início', 'Fim', 'Horas Est.']].head(20))
