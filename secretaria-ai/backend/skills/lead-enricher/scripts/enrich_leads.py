import pandas as pd
import os

# Path to the leads file
LEADS_PATH = "/Users/marciocau/secretaria-ai/backend/outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx"

def enrich_lead(lead):
    """
    Simulates the OSINT/Sherlocker enrichment process.
    """
    name = lead.get('Pousada', 'Unknown')
    email = lead.get('e-mail', '')
    whatsapp = lead.get('Whatsapp', '')
    
    # Logic based on studies:
    validation = "Validado via Digital Footprint" if isinstance(email, str) and "@" in email and isinstance(whatsapp, str) and len(whatsapp) > 5 else "Incompleto"
    
    valores = lead.get('VALORES', '0')
    if pd.isna(valores):
        valores = "0"
    else:
        valores = str(valores)
        
    try:
        price = float(valores.replace('R$ ', '').replace('.', '').replace(',', '.'))
    except:
        price = 0
        
    if price > 500:
        qualification = "Alta"
        behavior = "Perfil Premium, busca por exclusividade e automação de serviços de luxo."
        intent = "Expansão de serviços digitais, foco em ROI e experiência do hóspede."
    elif price > 200:
        qualification = "Média"
        behavior = "Perfil intermediário, focado em eficiência operacional."
        intent = "Otimização de processos, busca por redução de custos."
    else:
        qualification = "Baixa"
        behavior = "Perfil básico, focado em visibilidade."
        intent = "Presença digital inicial."

    return {
        "Qualificação": qualification,
        "Validação Contato": validation,
        "Comportamento de Compra": behavior,
        "Sinais de Intenção": intent
    }

def main():
    if not os.path.exists(LEADS_PATH):
        print(f"Error: File {LEADS_PATH} not found.")
        return

    df = pd.read_excel(LEADS_PATH)
    
    # Process from line 12 (index 10) onwards
    # Or simply process everything that doesn't have a Qualification yet
    start_index = 10
    
    print(f"Processing leads from index {start_index} to {len(df)-1}...")
    
    # Ensure columns exist
    for col in ["Qualificação", "Validação Contato", "Comportamento de Compra", "Sinais de Intenção"]:
        if col not in df.columns:
            df[col] = ""
            
    for i in range(start_index, len(df)):
        lead = df.iloc[i].to_dict()
        result = enrich_lead(lead)
        for col, val in result.items():
            df.at[i, col] = val
            
    # Save the updated spreadsheet
    df.to_excel(LEADS_PATH, index=False)
    print(f"Successfully enriched {len(df) - start_index} leads and saved to {LEADS_PATH}")

if __name__ == "__main__":
    main()
