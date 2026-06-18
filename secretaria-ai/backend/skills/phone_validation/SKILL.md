# SKILL: Phone OSINT Resolver

## Descrição
Motor de busca exaustiva e validação de números de telefone/WhatsApp para decisores de alto nível. Utiliza correlação de dados públicos (QSA/Receita Federal), metadados de redes sociais e verificação de presença em serviços de mensageria.

## Capacidades
1. **QSA Scraper**: Extração de números de contato registrados em quadros societários de empresas (CNPJs).
2. **Social Discovery**: Varredura de bios de Instagram, botões de contato de LinkedIn e perfis em diretórios de palestrantes.
3. **WA-Presence Check**: Simulação de verificação de conta ativa no WhatsApp para confirmar validade.
4. **Pattern Analysis**: Identificação de padrões de números corporativos vs. pessoais baseados em geolocalização (DDD).

## Estrutura
- `scripts/phone_resolver.py`: Lógica central de busca e validação.
- `scripts/wa_check.py`: Utilitário de verificação de presença em mensageria.

## Integração
Este skill é invocado pelo `OsintEnrichmentAgent` quando o score de confiança do WhatsApp é baixo ou desafiado pelo usuário.
