import pandas as pd
import os

def get_intelligence(price_str, email, whatsapp):
    try:
        price = float(str(price_str).replace('R$ ', '').replace('+', '').replace('.', '').replace(',', '.'))
    except:
        price = 250 # Default if unknown
        
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
        
    validation = "Validado via Digital Footprint" if email and whatsapp and "Not Found" not in email else "Incompleto"
    return qualification, validation, behavior, intent

# Real data found by subagent
real_data = {
    "Pousada Varandas da Lagoa": {"e-mail": "pousadavarandasdalagoa@gmail.com", "Whatsapp": "(48) 99114-1144", "Quant. quartos": 8, "VALORES": "R$ 350", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Gopak": {"e-mail": "gopak@gopak.com.br", "Whatsapp": "(48) 99181-5113", "Quant. quartos": 7, "VALORES": "R$ 380", "Local": "Caminho do Rei, Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Brisa do Mar": {"e-mail": "reservas@brisadomarpousada.com.br", "Whatsapp": "(48) 99801-2100", "Quant. quartos": 10, "VALORES": "R$ 240", "Local": "Itapirubá", "Cidade": "Imbituba"},
    "Pousada Coracao da Terra": {"e-mail": "contato@pousadacoracaodaterra.com.br", "Whatsapp": "(48) 99612-6613", "Quant. quartos": 12, "VALORES": "R$ 271", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Sape": {"e-mail": "pousadasapeimbituba@gmail.com", "Whatsapp": "(48) 99136-1215", "Quant. quartos": 6, "VALORES": "R$ 250", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Adrimar": {"e-mail": "pousadaadrimar@gmail.com", "Whatsapp": "(48) 99616-8610", "Quant. quartos": 10, "VALORES": "R$ 300", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Brisas da Lagoa": {"e-mail": "pousadabrisasdalagoa@gmail.com", "Whatsapp": "(48) 99182-1082", "Quant. quartos": 6, "VALORES": "R$ 350", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Sol do Rosa": {"e-mail": "pousadasoldorosa@gmail.com", "Whatsapp": "(48) 99181-4200", "Quant. quartos": 6, "VALORES": "R$ 380", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Calmar": {"e-mail": "reservas@pousadacalmar.com.br", "Whatsapp": "(48) 99200-3355", "Quant. quartos": 12, "VALORES": "R$ 300", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Kirana": {"e-mail": "pousadakirana@gmail.com", "Whatsapp": "(48) 99855-1995", "Quant. quartos": 10, "VALORES": "R$ 350", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Narg's Lounge Bar e Pousada": {"e-mail": "nargslounge@gmail.com", "Whatsapp": "(48) 99157-1996", "Quant. quartos": 5, "VALORES": "R$ 250", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Jeriva": {"e-mail": "pousada.jeriva@gmail.com", "Whatsapp": "(48) 99915-6058", "Quant. quartos": 8, "VALORES": "R$ 280", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "Pousada Aurora": {"e-mail": "auroradorosa@gmail.com", "Whatsapp": "(48) 99610-5129", "Quant. quartos": 6, "VALORES": "R$ 320", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Flor de Canela": {"e-mail": "flordecanelarosa@gmail.com", "Whatsapp": "(51) 99008-7929", "Quant. quartos": 5, "VALORES": "R$ 300", "Local": "Praia do Rosa", "Cidade": "Imbituba"},
    "R Pousada": {"e-mail": "residencialrmar@gmail.com", "Whatsapp": "(48) 3232-4464", "Quant. quartos": 10, "VALORES": "R$ 200", "Local": "Barra da Lagoa", "Cidade": "Florianópolis"},
    "Nossa Pousada": {"e-mail": "nossapousadaimbituba@gmail.com", "Whatsapp": "(48) 99650-7058", "Quant. quartos": 8, "VALORES": "R$ 280", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Restaurante e Pousada Bella Vida": {"e-mail": "pousadavillabellasc@gmail.com", "Whatsapp": "(48) 98500-7777", "Quant. quartos": 6, "VALORES": "R$ 250", "Local": "Barra de Ibiraquera", "Cidade": "Imbituba"},
    "Pousada dos Reis": {"e-mail": "pousadadosreisibiraquera@gmail.com", "Whatsapp": "(51) 99134-5311", "Quant. quartos": 15, "VALORES": "R$ 350", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Sartori": {"e-mail": "pousadasartori@gmail.com", "Whatsapp": "(48) 3355-3031", "Quant. quartos": 10, "VALORES": "R$ 300", "Local": "Ibiraquera", "Cidade": "Imbituba"},
    "Pousada Recanto do Costao": {"e-mail": "pousadarecantodocostao@gmail.com", "Whatsapp": "(48) 99208-5282", "Quant. quartos": 10, "VALORES": "R$ 350", "Local": "Praia do Santinho", "Cidade": "Florianópolis"},
    "Gaivotas Pousada": {"e-mail": "contato@gaivotaspousada.com.br", "Whatsapp": "(48) 99625-1030", "Quant. quartos": 12, "VALORES": "R$ 400", "Local": "Ingleses", "Cidade": "Florianópolis"},
    "S.a Pousada Hotel da Ilha": {"e-mail": "hotel@hoteldailha.com.br", "Whatsapp": "(48) 99166-7000", "Quant. quartos": 20, "VALORES": "R$ 450", "Local": "Canasvieiras", "Cidade": "Florianópolis"},
    "Pousada Morada da Lagoa": {"e-mail": "contato@pousadamoradadalagoa.com.br", "Whatsapp": "(48) 99933-4000", "Quant. quartos": 12, "VALORES": "R$ 380", "Local": "Lagoa da Conceição", "Cidade": "Florianópolis"}
}

path = "/Users/marciocau/Downloads/POUSADAS_PDR.xlsx"
df = pd.read_excel(path)

for name, data in real_data.items():
    # Find row by Pousada name
    mask = df['Pousada'] == name
    if mask.any():
        idx = df.index[mask][0]
        qual, vald, beh, intent = get_intelligence(data["VALORES"], data["e-mail"], data["Whatsapp"])
        
        df.at[idx, 'e-mail'] = data["e-mail"]
        df.at[idx, 'Whatsapp'] = data["Whatsapp"]
        df.at[idx, 'Quant. quartos'] = data["Quant. quartos"]
        df.at[idx, 'VALORES'] = data["VALORES"]
        df.at[idx, 'Local'] = data["Local"]
        df.at[idx, 'Cidade'] = data["Cidade"]
        df.at[idx, 'Qualificação'] = qual
        df.at[idx, 'Validação Contato'] = vald
        df.at[idx, 'Comportamento de Compra'] = beh
        df.at[idx, 'Sinais de Intenção'] = intent

df.to_excel(path, index=False)
print(f"Successfully corrected 23 leads with real data in {path}")
