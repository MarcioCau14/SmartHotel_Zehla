const XLSX = require('xlsx');
const path = require('path');
const os = require('os');

const filePath = path.join(os.homedir(), 'Downloads', 'POUSADAS_SAQUAREMA(1).xlsx');

const leads = [
  {
    "#": 1,
    "Pousada": "Pousada das Garças",
    "E-mail": "contato@pousadagarcas.com.br",
    "Whatsapp": "552226512116",
    "Qtd Quartos": 15,
    "Local / Praia": "Itaúna",
    "Cidade": "Saquarema",
    "UF": "RJ",
    "Valores Estimados": "R$ 450 - R$ 800",
    "Qualificação": "Alto Padrão - Próximo ao Pico",
    "Validação": "VALIDADO",
    "Comportamento de Compra": "Dono presente, valoriza exclusividade",
    "Sinais de Intenção": "Alta demanda no surf",
    "Redes Sociais": "instagram.com/pousadagarcas",
    "Site": "pousadagarcas.com.br",
    "Telefone": "2226512116",
    "Score Qual.": 95,
    "Score Valid.": 100
  },
  {
    "#": 2,
    "Pousada": "Solar de Itaúna",
    "E-mail": "reservas@solardeitauna.com.br",
    "Whatsapp": "5522998346471",
    "Qtd Quartos": 12,
    "Local / Praia": "Itaúna",
    "Cidade": "Saquarema",
    "UF": "RJ",
    "Valores Estimados": "R$ 400 - R$ 700",
    "Qualificação": "Médio-Alto Padrão - Familiar",
    "Validação": "VALIDADO",
    "Comportamento de Compra": "Focado em reservas diretas",
    "Sinais de Intenção": "Investindo em marketing local",
    "Redes Sociais": "instagram.com/solardeitauna",
    "Site": "solardeitauna.com.br",
    "Telefone": "22998346471",
    "Score Qual.": 88,
    "Score Valid.": 100
  },
  {
    "#": 3,
    "Pousada": "Laje de Itaúna (Hotel e Spa)",
    "E-mail": "laje.itauna@gmail.com",
    "Whatsapp": "552226512389",
    "Qtd Quartos": 20,
    "Local / Praia": "Itaúna",
    "Cidade": "Saquarema",
    "UF": "RJ",
    "Valores Estimados": "R$ 600 - R$ 1200",
    "Qualificação": "Luxo - Spa e Conforto",
    "Validação": "VALIDADO",
    "Comportamento de Compra": "Público exigente, ticket alto",
    "Sinais de Intenção": "Busca automação de serviços",
    "Redes Sociais": "instagram.com/lajeitauna",
    "Site": "pousadasitauna.com.br",
    "Telefone": "2226512389",
    "Score Qual.": 98,
    "Score Valid.": 90
  },
  {
    "#": 4,
    "Pousada": "Paraíso de Itaúna",
    "E-mail": "contato@pousadaparaisodeitauna.com",
    "Whatsapp": "5521988909602",
    "Qtd Quartos": 10,
    "Local / Praia": "Itaúna",
    "Cidade": "Saquarema",
    "UF": "RJ",
    "Valores Estimados": "R$ 350 - R$ 600",
    "Qualificação": "Pé na areia - Surf oriented",
    "Validação": "AGUARDANDO",
    "Comportamento de Compra": "Espírito jovem, surfistas",
    "Sinais de Intenção": "Gargalo no atendimento WhatsApp",
    "Redes Sociais": "instagram.com/paraisodeitauna",
    "Site": "pousadaparaisodeitauna.com",
    "Telefone": "21988909602",
    "Score Qual.": 85,
    "Score Valid.": 70
  },
  {
    "#": 5,
    "Pousada": "Castelhana Sudoeste",
    "E-mail": "reservas@castelhanasudoeste.com.br",
    "Whatsapp": "552127193530",
    "Qtd Quartos": 8,
    "Local / Praia": "Itaúna",
    "Cidade": "Saquarema",
    "UF": "RJ",
    "Valores Estimados": "R$ 500 - R$ 900",
    "Qualificação": "Exclusiva - Design Moderno",
    "Validação": "PROSPECT",
    "Comportamento de Compra": "Foco em experiência e design",
    "Sinais de Intenção": "Pouca presença digital agressiva",
    "Redes Sociais": "instagram.com/castelhanasudoeste",
    "Site": "castelhanasudoeste.com.br",
    "Telefone": "2127193530",
    "Score Qual.": 92,
    "Score Valid.": 60
  }
];

const ws = XLSX.utils.json_to_sheet(leads);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Leads");

XLSX.writeFile(wb, filePath);
console.log(`Planilha gerada com sucesso em: ${filePath}`);
