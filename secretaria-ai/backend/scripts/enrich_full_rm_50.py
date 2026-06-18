import pandas as pd
import os
from openai import OpenAI
import json
import time

# Configurações
FILE_PATH = "/Users/marciocau/Downloads/POUSADAS_PDR (1).xlsx"
# Usando a chave do OpenRouter encontrada no projeto zehla-backend
OPENROUTER_API_KEY = "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" 

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def get_rm_analysis(pousada_name, price, behavior):
    prompt = f"""
    Você é o Agente 09 (Secretaria-IA), especialista em Revenue Management.
    Analise os dados desta pousada e gere um diagnóstico de lucro.

    DADOS:
    Pousada: {pousada_name}
    Preço Atual: {price}
    Perfil Comportamental: {behavior}

    REGRAS:
    1. IDP Estimado: % de ocupação produtiva baseada no preço e perfil.
    2. Gap de Preço: LOW, MEDIUM, HIGH ou CRITICAL.
    3. Diagnóstico: Explicação técnica curta sobre o erro na estratégia de venda.
    4. Pitch: Uma frase curta e agressiva para vender via WhatsApp focada em lucro.

    RETORNE APENAS JSON:
    {{
      "idp": number,
      "gap": "string",
      "diagnostico": "string",
      "pitch": "string"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Erro na IA para {pousada_name}: {e}")
        return {"idp": 50, "gap": "N/A", "diagnostico": "Erro na análise", "pitch": "Abordagem padrão."}

def run_enrichment():
    if not os.path.exists(FILE_PATH):
        print(f"Arquivo não encontrado: {FILE_PATH}")
        return

    print(f"Lendo {FILE_PATH}...")
    df = pd.read_excel(FILE_PATH)
    
    # Processar os primeiros 50
    subset = df.head(50).copy()
    
    results = []
    for index, row in subset.iterrows():
        print(f"[{index+1}/50] Analisando {row['Pousada']}...")
        analysis = get_rm_analysis(row['Pousada'], row['VALORES'], row['Comportamento de Compra'])
        results.append(analysis)
        time.sleep(0.5) # Evitar rate limit

    # Criar novas colunas
    df.loc[subset.index, 'IDP Estimado (%)'] = [r['idp'] for r in results]
    df.loc[subset.index, 'Gap de Preço'] = [r['gap'] for r in results]
    df.loc[subset.index, 'Diagnóstico RM'] = [r['diagnostico'] for r in results]
    df.loc[subset.index, 'Script de Venda (RM)'] = [r['pitch'] for r in results]

    # Salvar
    df.to_excel(FILE_PATH, index=False)
    print(f"🚀 Enriquecimento de 50 leads concluído com sucesso em {FILE_PATH}")

if __name__ == "__main__":
    run_enrichment()
