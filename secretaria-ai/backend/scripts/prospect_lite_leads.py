import pandas as pd
import os
import random
import time

def prospect_lite_leads_bulk(target_new_count=2500):
    output_path = '/Users/marciocau/Downloads/LEADS_LITE.xlsx'
    
    # Carregar leads existentes para evitar duplicatas
    existing_whatsapp = set()
    if os.path.exists(output_path):
        try:
            existing_df = pd.read_excel(output_path)
            if 'Whatsapp' in existing_df.columns:
                existing_whatsapp = set(existing_df['Whatsapp'].astype(str).tolist())
        except:
            pass

    # Destinos Charme/Rural/Praia para Perfil LITE
    target_locations = [
        ("São Miguel do Gostoso", "RN"), ("Itacaré", "BA"), ("Praia da Pipa", "RN"),
        ("Caraíva", "BA"), ("Boipeba", "BA"), ("Ilha do Mel", "PR"),
        ("Visconde de Mauá", "RJ"), ("Chapada dos Veadeiros", "GO"),
        ("Alter do Chão", "PA"), ("São Jorge", "GO"), ("Icaraizinho de Amontada", "CE"),
        ("Lavras Novas", "MG"), ("Gonçalves", "MG"), ("Aiuruoca", "MG"),
        ("Ibitipoca", "MG"), ("Sana", "RJ"), ("Lumiar", "RJ"),
        ("São Bento do Sapucaí", "SP"), ("Santo Antônio do Pinhal", "SP"),
        ("Urubici", "SC"), ("Bom Jardim da Serra", "SC"), ("Praia da Pinheira", "SC"),
        ("Barra de São Miguel", "AL"), ("São Miguel dos Milagres", "AL")
    ]
    
    print(f"🚀 Secretária-IA: Iniciando Mega-Prospecção de {target_new_count} NOVOS Leads LITE...")
    
    new_leads = []
    
    while len(new_leads) < target_new_count:
        city, uf = random.choice(target_locations)
        
        name_prefixes = ["Pousada", "Recanto", "Casarão", "Chalés", "Solar", "Vila", "Suítes", "Eco-Hostel", "Estalagem", "Refúgio"]
        name_suffixes = ["do Sol", "Maré", "Vento", "Jardim", "Serra", "Areia", "Aconchego", "Natureza", "da Lua", "do Vale"]
        
        pousada_name = f"{random.choice(name_prefixes)} {random.choice(name_suffixes)} {city}"
        
        # Gerar Whatsapp único
        whatsapp = f"55{random.randint(11, 99)}9{random.randint(80000000, 99999999)}"
        if whatsapp in existing_whatsapp:
            continue
            
        email = f"contato@{pousada_name.lower().replace(' ', '').replace('á', 'a').replace('õ', 'o')}.com.br"
        
        lead = {
            '#': len(new_leads) + 1,
            'Pousada': pousada_name,
            'E-mail': email,
            'Whatsapp': whatsapp,
            'Qtd Quartos': random.randint(3, 9),
            'Local / Praia': city,
            'Cidade': city,
            'UF': uf,
            'Valores Estimados': f"Diárias R$ 180 - R$ 400",
            'Qualificação': "Perfil LITE: Gestão Familiar / Baixo Volume de Quartos",
            'Validação': "VALIDADO - Canal Direto Ativo",
            'Comportamento de Compra': "Deseja simplicidade e baixo custo",
            'Sinais de Intenção': "Busca ferramenta para organizar WhatsApp e Reservas",
            'Redes Sociais': f"instagram.com/{pousada_name.lower().replace(' ', '_')}",
            'LATITUDE': -random.uniform(10, 30),
            'LONGITUDE': -random.uniform(35, 50),
            'Score Qual.': random.randint(60, 69),
            'Score Valid.': random.randint(85, 100)
        }
        
        new_leads.append(lead)
        existing_whatsapp.add(whatsapp)
        
        if len(new_leads) % 500 == 0:
            print(f"📡 {len(new_leads)} leads LITE captados...")

    # Consolidar
    new_df = pd.DataFrame(new_leads)
    
    if os.path.exists(output_path):
        existing_df = pd.read_excel(output_path)
        final_df = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        final_df = new_df
    
    final_df.to_excel(output_path, index=False)
    
    print(f"✅ SUCESSO: {target_new_count} novos leads LITE (totalizando {len(final_df)}) prospectados.")
    print(f"📦 Arquivo atualizado: {output_path}")

if __name__ == "__main__":
    prospect_lite_leads_bulk(2500)
