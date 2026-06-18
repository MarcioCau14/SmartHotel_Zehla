import pandas as pd
import glob
import os
import sys

def classify_leads():
    input_dir = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_'
    output_dir = '/Users/marciocau/Downloads'
    
    all_files = glob.glob(os.path.join(input_dir, "*.xlsx"))
    
    if not all_files:
        print(f"❌ Nenhuma planilha encontrada em {input_dir}")
        return

    print(f"🔍 Iniciando análise de {len(all_files)} planilhas...")
    
    df_list = []
    for file in all_files:
        try:
            df = pd.read_excel(file)
            df_list.append(df)
            print(f"✅ Lida: {os.path.basename(file)} ({len(df)} leads)")
        except Exception as e:
            print(f"⚠️ Erro ao ler {file}: {e}")

    if not df_list:
        return

    # Consolidar todos os 11.507+ leads
    master_df = pd.concat(df_list, ignore_index=True)
    
    # Limpeza básica de nomes de colunas
    master_df.columns = [c.strip() for c in master_df.columns]

    initial_count = len(master_df)
    print(f"🧠 Analisando {initial_count} pousadas...")

    # DEDUPLICAÇÃO (O SUPER-PODER DE LIMPEZA DA SECRETÁRIA-IA)
    # Priorizar linhas com mais dados preenchidos ao remover duplicados
    master_df['fill_count'] = master_df.count(axis=1)
    master_df = master_df.sort_values('fill_count', ascending=False)
    
    # Remover duplicados por Whatsapp (principal identificador) e E-mail
    master_df = master_df.drop_duplicates(subset=['Whatsapp'], keep='first')
    master_df = master_df.drop_duplicates(subset=['E-mail'], keep='first')
    
    final_count = len(master_df)
    duplicates_removed = initial_count - final_count
    print(f"🧹 Deduplicação concluída: {duplicates_removed} leads repetidos removidos.")

    # Função de Classificação Inteligente (Brain ZEHLA)
    def classify(row):
        # 1. Extrair Qtd Quartos (converter para int se possível)
        try:
            rooms = int(row.get('Qtd Quartos', 0))
        except:
            rooms = 0
            
        # 2. Extrair Scores
        try:
            score_qual = float(row.get('Score Qual.', 0))
        except:
            score_qual = 0
            
        # 3. Analisar Valores Estimados e Qualificação
        desc = str(row.get('Qualificação', '')).lower() + str(row.get('Valores Estimados', '')).lower()
        is_premium = any(term in desc for term in ['luxo', 'premium', 'boutique', 'alto padrão', 'exclusive', 'resort'])

        # LÓGICA DE CATEGORIZAÇÃO
        if rooms > 20 or is_premium or score_qual >= 90:
            return 'MAX'
        elif rooms >= 10 or score_qual >= 70:
            return 'PRO'
        else:
            return 'LITE'

    # Aplicar classificação
    master_df['Zehla_Plan'] = master_df.apply(classify, axis=1)

    # Colunas obrigatórias conforme pedido do usuário
    cols = [
        'Pousada', 'E-mail', 'Whatsapp', 'Qtd Quartos', 'Local / Praia', 
        'Cidade', 'UF', 'Valores Estimados', 'Qualificação', 'Validação', 
        'Comportamento de Compra', 'Sinais de Intenção', 'Redes Sociais', 
        'LATITUDE', 'LONGITUDE', 'Score Qual.', 'Score Valid.'
    ]

    # Filtrar apenas as colunas solicitadas
    # (Se alguma coluna faltar na origem, criamos como vazio para manter a estrutura)
    for col in cols:
        if col not in master_df.columns:
            master_df[col] = ''

    # Criar as 3 planilhas separadas
    plans = {
        'MAX': 'LEADS_MAX.xlsx',
        'PRO': 'LEADS_PRO.xlsx',
        'LITE': 'LEADS_LITE.xlsx'
    }

    for plan_type, filename in plans.items():
        subset = master_df[master_df['Zehla_Plan'] == plan_type][cols]
        output_path = os.path.join(output_dir, filename)
        subset.to_excel(output_path, index=False)
        print(f"📦 Auditada e Gerada: {filename} ({len(subset)} leads)")

    print(f"\n📊 RELATÓRIO FINAL DE AUDITORIA (SECRETÁRIA-IA):")
    print(f"Total Processado: {initial_count}")
    print(f"Duplicados Removidos: {duplicates_removed}")
    print(f"Leads Únicos Qualificados: {final_count}")
    print(f"Distribuição: MAX({len(master_df[master_df['Zehla_Plan']=='MAX'])}) | PRO({len(master_df[master_df['Zehla_Plan']=='PRO'])}) | LITE({len(master_df[master_df['Zehla_Plan']=='LITE'])})")
    print("\n✅ TUDO EM ORDEM! Os leads foram limpos, recontados e re-classificados.")

if __name__ == "__main__":
    classify_leads()
