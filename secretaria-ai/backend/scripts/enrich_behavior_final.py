import pandas as pd
import os

def get_behavior_profile(name):
    name_lower = str(name).lower()
    
    # 1. Premium / Luxury (Based on findings)
    premium_list = [
        "bucanero", "village", "rêmora", "solar mirador", "quinta do bucanero", 
        "casas do mar", "vid sol e mar", "vistacalma", "descanso do rei", "hanalie",
        "morada dos bougainvilles"
    ]
    if any(p in name_lower for p in premium_list):
        return "Comportamento Seletivo: Alta exigência por automação e exclusividade. Foco em ROI e experiência do hóspede de alto padrão."

    # 2. High-Touch / Personal Brand
    personal_list = [
        "sol do rosa", "aurora", "morada da lagoa", "gilberto", "karina", 
        "eduardo", "lili", "ondas da barra", "don't find", "mães", "recanto do costão",
        "calmar", "sartori"
    ]
    if any(p in name_lower for p in personal_list):
        return "Gestão Humanizada: Valoriza relacionamento direto e atendimento personalizado. Busca ferramentas que otimizem o tempo do dono sem perder o toque pessoal."

    # 3. Modern / Agile / Tech-Savvy
    modern_list = [
        "mevam", "kauai", "gopak", "kirana", "watu kerere", "aloha rosa", 
        "sentiero", "brisas da lagoa"
    ]
    if any(p in name_lower for p in modern_list):
        return "Perfil Digital/Ágil: Adota tecnologias para facilitar o fluxo do hóspede. Foco em check-in rápido e automação de reservas."

    # 4. Operational / Volume / Tradition
    volume_list = [
        "golfinhos", "lopes residence", "lagoinha", "gaivotas", "barcelos", 
        "pousada dos reis", "adrimar", "brisa do mar", "sol & sal", "hotel praia do rosa"
    ]
    if any(p in name_lower for p in volume_list):
        return "Foco em Eficiência: Comportamento voltado para redução de custos e escala. Busca automação de processos repetitivos e gestão de equipe."

    # 5. High Friction / Need for Modernization
    friction_list = [
        "s.a pousada", "nossa pousada", "r pousada", "bella vida", "jeriva", 
        "coracao da terra", "sape", "flor de canela", "aurora", "porto"
    ]
    if any(p in name_lower for p in friction_list):
        return "Oportunidade de Modernização: Resistência a taxas (CC/OTAs). Processos tradicionais/offline com grande potencial para digitalização."

    # 6. Lifestyle / Entertainment
    lifestyle_list = [
        "beer praia", "narg's", "lounge", "magia beach"
    ]
    if any(p in name_lower for p in lifestyle_list):
        return "Lifestyle/Nicho: Focado em experiência jovem e eventos. Busca integração entre hospedagem e serviços de entretenimento."

    # Default for remaining
    return "Comportamento Moderado: Equilíbrio entre tradição e abertura tecnológica. Valoriza ferramentas com prova social clara."

def update_leads():
    file_path = "/Users/marciocau/Downloads/POUSADAS_PDR.xlsx"
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    df = pd.read_excel(file_path)
    
    print(f"Enriching behavior for {len(df)} leads...")
    
    df['Comportamento de Compra'] = df['Pousada'].apply(get_behavior_profile)
    
    # Also update 'Qualificação' based on the profile
    def qualify(behavior):
        if "Premium" in behavior or "Seletivo" in behavior:
            return "ALTA (ICP A+)"
        if "Gestão Humanizada" in behavior or "Digital" in behavior:
            return "MÉDIA (ICP A)"
        if "Oportunidade" in behavior:
            return "MÉDIA (Potencial Upgrade)"
        return "NORMAL"

    df['Qualificação'] = df['Comportamento de Compra'].apply(qualify)

    # Save back to Excel
    df.to_excel(file_path, index=False)
    print(f"Successfully updated {file_path}")

if __name__ == "__main__":
    update_leads()
