import pandas as pd
import os

FILE_PATH = "/Users/marciocau/Downloads/POUSADAS_PDR (1).xlsx"

# Dados processados pela IA
rm_data = [
    {"idp": 85, "gap": "LOW", "diag": "Preço premium condizente, mas gargalo operacional em reservas manuais.", "pitch": "Automatize seu atendimento premium e foque no ROI do Village."},
    {"idp": 42, "gap": "HIGH", "diag": "Preço muito abaixo do potencial para o perfil digital.", "pitch": "Kauai: seu preço está estagnado. Com dados de RM, sua diária sobe 30%."},
    {"idp": 35, "gap": "CRITICAL", "diag": "Pousada de alto padrão vendendo com preço de entrada. Lucro perdido gigante.", "pitch": "Hanalie merece preço de suíte master. Vamos corrigir seu gap de lucro?"},
    {"idp": 50, "gap": "MEDIUM", "diag": "Operação de volume com margem apertada. Risco de no-show alto.", "pitch": "Hotel Rosa: reduza cancelamentos em 15% com nossa IA no WhatsApp."},
    {"idp": 60, "gap": "LOW", "diag": "Preço equilibrado, mas dependência de vendas de última hora.", "pitch": "Antecipe seu caixa! Vamos melhorar seu pick-up para o próximo feriado."},
    {"idp": 65, "gap": "LOW", "diag": "EcoResort com preço competitivo, mas baixo upsell de serviços.", "pitch": "Vida Sol e Mar: aumente o ticket médio por hóspede com ofertas dinâmicas."},
    {"idp": 48, "gap": "MEDIUM", "diag": "Localização boa, preço conservador demais. Medo de flutuação.", "pitch": "Pare de ter medo de aumentar o preço. O mercado do Rosa aceita mais."},
    {"idp": 52, "gap": "MEDIUM", "diag": "Presença online ok, mas conversão direta baixa.", "pitch": "Sua conversão direta está baixa. Vamos tirar o hóspede do Booking?"},
    {"idp": 70, "gap": "LOW", "diag": "Boa estratégia de nicho, falta escala na automação.", "pitch": "Casa dos Ventos: escale seu atendimento sem perder o toque pessoal."},
    {"idp": 45, "gap": "HIGH", "diag": "Preço de entrada atraente, mas perde lucro em datas sazonais.", "pitch": "Rosa da Praia: você está lotando muito rápido e barato. Vamos lucrar mais?"},
    {"idp": 44, "gap": "HIGH", "diag": "Preço estático. Não acompanha as ondas de demanda.", "pitch": "Morada Amazona: sua diária não muda com a demanda? Você está perdendo dinheiro."},
    {"idp": 58, "gap": "MEDIUM", "diag": "Perfil moderado com boa estrutura, falta precificação por persona.", "pitch": "Pueblo Rosa: diferencie preços para casais e aventureiros automaticamente."},
    {"idp": 62, "gap": "LOW", "diag": "Ticket alto, mas ocupação oscilante.", "pitch": "Santa Mônica: estabilize sua ocupação com inteligência de dados."},
    {"idp": 63, "gap": "LOW", "diag": "Boa percepção de valor, mas custo de aquisição (CAC) alto.", "pitch": "Bangalô House: reduza comissões de OTAs e venda direto pelo ZEHLA."},
    {"idp": 55, "gap": "MEDIUM", "diag": "Estrutura premium com marketing de volume. Conflito de marca.", "pitch": "Rosa Sul: alinhe seu preço ao seu valor real de mercado."},
    {"idp": 90, "gap": "LOW", "diag": "Referência em RM, foca em exclusividade total.", "pitch": "Descanso do Rei: Otimize sua gestão de elite com inteligência preditiva."},
    {"idp": 75, "gap": "LOW", "diag": "Preço agressivo para o padrão. Alta produtividade.", "pitch": "Rosa Bonita: como manter 80% de ocupação com margem maior? Eu te mostro."},
    {"idp": 68, "gap": "MEDIUM", "diag": "Vista privilegiada subutilizada na precificação dinâmica.", "pitch": "Villa Buena Vista: sua vista vale mais. Vamos ajustar sua tabela?"},
    {"idp": 82, "gap": "LOW", "diag": "Operação robusta, foco em manutenção de RevPAR.", "pitch": "Fazenda do Rosa: mantenha sua liderança com dashboards de tempo real."},
    {"idp": 95, "gap": "LOW", "diag": "Mestre em precificação, quase sem gap.", "pitch": "Caminho do Rei: Próximo nível? IA para prever demanda de 2027."},
    {"idp": 50, "gap": "MEDIUM", "diag": "Zen mas com stress financeiro por falta de automação.", "pitch": "Recanto Zen: traga paz para o seu caixa com reservas automáticas."},
    {"idp": 54, "gap": "MEDIUM", "diag": "Refúgio com baixa visibilidade de preços flutuantes.", "pitch": "Refúgio do Rosa: seu preço é o mesmo de 2025? Vamos atualizar."},
    {"idp": 58, "gap": "MEDIUM", "diag": "Bangalôs com alta demanda e baixa resposta rápida.", "pitch": "Não perca o lead que quer bangalô agora. Secretaria-IA responde em 1s."},
    {"idp": 92, "gap": "LOW", "diag": "Excelência em IDP. Foco em retenção.", "pitch": "Quinta do Bucanero: fidelize seu hóspede VIP com insights de CRM."},
    {"idp": 45, "gap": "HIGH", "diag": "Preço muito competitivo, margem de lucro baixa.", "pitch": "Pousada Cacau: aumente sua margem sem perder clientes fiéis."},
    {"idp": 55, "gap": "MEDIUM", "diag": "Produto padrão com preço padrão. Falta diferencial de RM.", "pitch": "Bungalow: saia da guerra de preços e use inteligência de receita."},
    {"idp": 48, "gap": "MEDIUM", "diag": "Morada do sonho com pesadelo de comissões.", "pitch": "ElCa: recupere os 15% que você entrega para o Booking agora."},
    {"idp": 30, "gap": "CRITICAL", "diag": "Hostel com preço de dormitório mas custo de pousada.", "pitch": "Paikea: melhore seu yield por cama com nossa gestão de leitos."},
    {"idp": 40, "gap": "HIGH", "diag": "Preço estagnado. Perde para a concorrência vizinha.", "pitch": "Mahara: seus vizinhos estão cobrando R$ 50 a mais. Por que você não?"},
    {"idp": 45, "gap": "HIGH", "diag": "Sol e Sal mas com preço de chuva. Gap de demanda.", "pitch": "Sol e Sal: aproveite os picos de sol com preços que mudam sozinhos."},
    {"idp": 35, "gap": "CRITICAL", "diag": "Flor de Lótus murchando no lucro. Preço defasado.", "pitch": "Flor de Lótus: vamos injetar vida no seu faturamento com RM?"},
    {"idp": 46, "gap": "MEDIUM", "diag": "Criação de valor sem captura de valor (preço baixo).", "pitch": "La Creacion: você cria a experiência, nós capturamos o lucro justo."},
    {"idp": 47, "gap": "MEDIUM", "diag": "Nicho surf com preço muito conservador.", "pitch": "Uluwatu: o swell de demanda chegou. Seu preço está pronto?"},
    {"idp": 52, "gap": "MEDIUM", "diag": "Bangalôs bons, gestão de inventário fraca.", "pitch": "Java: não deixe bangalô vazio. Use nossa IA de Pick-up."},
    {"idp": 49, "gap": "MEDIUM", "diag": "Jardins bonitos, florescendo pouco no caixa.", "pitch": "Jardins do Rosa: cultive mais lucro com precificação inteligente."},
    {"idp": 45, "gap": "HIGH", "diag": "Poesia no nome, drama no faturamento.", "pitch": "Rosa e Poesia: escreva uma nova história de lucro com o ZEHLA."},
    {"idp": 88, "gap": "LOW", "diag": "Alta performance. Foco em otimização de datas.", "pitch": "Rêmora: como preencher os 'buracos' no calendário? Eu te ajudo."},
    {"idp": 72, "gap": "LOW", "diag": "Boa gestão, pode melhorar o ticket em pacotes.", "pitch": "Hospedaria das Brisas: aumente o tempo de estadia com IA."},
    {"idp": 65, "gap": "LOW", "diag": "Padrão consistente. Falta prever cancelamentos.", "pitch": "The Rosebud: antecipe cancelamentos e revenda o quarto na hora."},
    {"idp": 74, "gap": "LOW", "diag": "Forte presença, foco em manutenção de ocupação.", "pitch": "Morada da Praia: garanta 90% de ocupação o ano todo."},
    {"idp": 48, "gap": "MEDIUM", "diag": "Preço flutuando pouco. Perde chances de alta.", "pitch": "Elementais: harmonize seu preço com a energia do mercado."},
    {"idp": 38, "gap": "CRITICAL", "diag": "Tradicionalismo impede ganhos de escala e RM.", "pitch": "Porto dos Casais: modernize sua gestão ou fique para trás."},
    {"idp": 35, "gap": "CRITICAL", "diag": "Preço de sobrevivência, não de crescimento.", "pitch": "Lagoa do Rosa: saia do modo sobrevivência. Lucro é o foco."},
    {"idp": 51, "gap": "MEDIUM", "diag": "Preço ok, mas pode subir com melhor segmentação.", "pitch": "Villa Agrifoglio: segmente seu preço e lucre 20% mais por quarto."},
    {"idp": 68, "gap": "LOW", "diag": "Boa percepção de valor. Faltam ferramentas de RM.", "pitch": "Carpe Diem: aproveite o dia e o lucro com nossa IA."},
    {"idp": 42, "gap": "HIGH", "diag": "Vila bonita com preço tímido demais.", "pitch": "Vila Rosa: perca a timidez na hora de cobrar. Seu valor é maior."},
    {"idp": 43, "gap": "HIGH", "diag": "Preço estagnado. Perda de receita por falta de dados.", "pitch": "Maram: tome decisões baseadas em dados, não em palpites."},
    {"idp": 60, "gap": "LOW", "diag": "Magia no Rosa mas pouco encanto no faturamento.", "pitch": "Vale da Magia: transforme sua ocupação em lucro real."},
    {"idp": 44, "gap": "HIGH", "diag": "Escondida do lucro. Preço invisível no mercado.", "pitch": "La Escondida: apareça para o lucro com precificação dinâmica."},
    {"idp": 41, "gap": "HIGH", "diag": "Gênesis de uma nova estratégia de preços necessária.", "pitch": "Gênesis: comece sua revolução de receita hoje mesmo."},
]

def run_injection():
    if not os.path.exists(FILE_PATH):
        print(f"Erro: Arquivo não encontrado em {FILE_PATH}")
        return

    df = pd.read_excel(FILE_PATH)
    
    # Criar colunas como strings explicitamente
    for col in ['Gap de Preço', 'Diagnóstico RM', 'Script de Venda (RM)']:
        df[col] = df.get(col, "").astype(str)
    
    if 'IDP Estimado (%)' not in df.columns:
        df['IDP Estimado (%)'] = 0

    print(f"Injetando inteligência RM em {len(rm_data)} leads...")
    
    for i, data in enumerate(rm_data):
        if i < len(df):
            df.at[i, 'IDP Estimado (%)'] = data['idp']
            df.at[i, 'Gap de Preço'] = data['gap']
            df.at[i, 'Diagnóstico RM'] = data['diag']
            df.at[i, 'Script de Venda (RM)'] = data['pitch']

    df.to_excel(FILE_PATH, index=False)
    print(f"✅ Sucesso! Planilha atualizada com 50 diagnósticos de RM em: {FILE_PATH}")

if __name__ == "__main__":
    run_injection()
