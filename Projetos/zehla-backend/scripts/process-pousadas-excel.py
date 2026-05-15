import pandas as pd
import os

def process_leads_excel():
    file_path = "/Users/marciocau/Downloads/POUSADAS_PDR (1).xlsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return

    try:
        # Lendo o arquivo Excel
        df = pd.read_excel(file_path)
        
        print(f"📊 [Zehla Brain] Analisando planilha: {file_path}")
        print(f"📈 Total de linhas encontradas: {len(df)}")
        
        # Colunas prováveis (ajustando para lowercase para busca flexível)
        cols = [str(c).lower() for c in df.columns]
        print(f"📋 Colunas identificadas: {', '.join(df.columns)}")

        # Extraindo dados únicos para "memorização"
        # Normalizando nomes de colunas para busca robusta
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        contacts = []
        for index, row in df.iterrows():
            contact = {
                "nome": str(row.get('pousada', row.get('nome', 'N/A'))),
                "whatsapp": str(row.get('whatsapp', row.get('telefone', 'N/A'))),
                "email": str(row.get('e-mail', row.get('email', 'N/A'))),
                "cidade": str(row.get('cidade', 'N/A'))
            }
            contacts.append(contact)

        # Resumo
        unique_wa = df['whatsapp'].nunique() if 'whatsapp' in df.columns else len(df)
        
        print(f"\n✅ [MEMORIZAÇÃO CONCLUÍDA]")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📍 Região: Litoral de Santa Catarina")
        print(f"👥 Contatos Únicos Decorados: {unique_wa}")
        print(f"🎯 Meta: 1000 contatos (Faltam: {1000 - unique_wa})")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        # Exibindo os primeiros 5 para confirmação
        print("🔍 Amostra dos contatos memorizados:")
        for c in contacts[:5]:
            print(f" - {c['nome']} | {c['whatsapp']} | {c['email']}")

    except Exception as e:
        print(f"❌ Erro ao ler planilha: {e}")

if __name__ == "__main__":
    process_leads_excel()
