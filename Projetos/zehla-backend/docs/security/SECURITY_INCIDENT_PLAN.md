# 🚨 ZEHLA Incident Response Plan (IRP) v1.0

Este documento define as ações imediatas em caso de violação de segurança ou vazamento de dados no ecossistema ZEHLA, conforme exigido pela LGPD.

## 1. Classificação de Incidentes
- **LOW**: Tentativas de login falhas, erros de assinatura HMAC isolados.
- **MEDIUM**: Acesso não autorizado a dashboards sem exportação de dados.
- **HIGH**: Vazamento de PII (nomes, telefones) de menos de 100 leads.
- **CRITICAL**: Vazamento em massa (>1.000 leads), quebra na corrente de hash financeira, ou comprometimento de chaves mestras (KEK).

## 2. Protocolo de Resposta (Fases)

### Fase 1: Identificação & Triagem
- O **Guardian Alert** dispara via Telegram/E-mail.
- O Administrador deve verificar se o alerta é um falso positivo via `Audit Logs`.
- Se confirmado, o incidente é classificado e o "War Room" de crise é aberto.

### Fase 2: Contenção Imediata
- **Bloqueio de Sessões**: Revogar todos os tokens de sessão JWT e sessoes WhatsApp.
- **Isolamento de Banco**: Ativar o modo `READ_ONLY` no Prisma (se necessário).
- **Rotação de Chaves**: Se houver suspeita de vazamento de KEK, iniciar a rotação imediata de chaves via Script de Emergência.

### Fase 3: Erradicação & Recuperação
- Identificar a vulnerabilidade raiz (exploit, injeção, falha de permissão).
- Aplicar o patch de segurança.
- Restaurar dados a partir do último backup íntegro (RPO: 1h).

### Fase 4: Notificação (LGPD Art. 48)
- **ANPD**: Notificar em até **72 horas** em caso de risco relevante aos titulares.
- **Hoteleiros**: Enviar comunicado via canal oficial explicando o incidente e as medidas tomadas.

## 3. Contatos de Emergência
- **DPO (Data Protection Officer)**: [Inserir Contato]
- **Time de Segurança**: [Inserir Contato]
- **Assessoria Jurídica**: [Inserir Contato]

## 4. Auditoria Pós-Incidente
- Todo incidente deve gerar um relatório de **Post-Mortem** anexado ao `SecurityIncident` no banco de dados.
- Revisão das políticas de `Rate Limiting` e `RBAC` para evitar reincidência.

---
> [!IMPORTANT]
> A falha em seguir este protocolo pode resultar em multas de até 2% do faturamento ou R$ 50M por infração.
