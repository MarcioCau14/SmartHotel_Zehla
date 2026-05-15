# Plano de Execução: ZEHLA como Orquestrador do ZCC

Este documento simula o comportamento do "Cérebro ZEHLA" atuando como orquestrador central do sistema, reagindo a diferentes estímulos de segurança, marketing e operação.

---

## 🛡️ Situação 01: Detecção de Intrusão (Canary Alert)
**Estímulo**: Um robô de varredura (crawler) tenta acessar um registro de reserva marcado como `isCanary=true`.

### Comportamento do Cérebro:
1.  **Detecção Instantânea**: O middleware do Prisma intercepta o acesso ao Honeypot.
2.  **Triagem Automática**: Identifica que o IP não pertence a um administrador autorizado.
3.  **Ação Defensiva**: 
    - Dispara um alerta `CRITICAL` para o Guardião.
    - Bloqueia o IP preventivamente no firewall da aplicação (se configurado).
4.  **Notificação ZCC**: O painel de Segurança pisca em vermelho com os detalhes da tentativa.
5.  **Relatório**: "Tentativa de acesso a dados sensíveis contida. Alvo: Reserva Honeypot ID: 5543."

---

## 📈 Situação 02: Oportunidade de Marketing (Lead de SC)
**Estímulo**: Um novo lead é adicionado à planilha da **Secretaria-IA** na região da Praia do Rosa.

### Comportamento do Cérebro:
1.  **Sincronização**: Ao clicar em "Sync" no ZCC, o cérebro importa o novo contato.
2.  **Enriquecimento**: Cruza o lead com o histórico para garantir que não é um usuário antigo.
3.  **Sugestão de Isca**: Identifica que a pousada paga altas taxas no Booking.com.
4.  **Orquestração**: 
    - Prepara uma campanha de WhatsApp personalizada com o script "Alívio da Taxa Zero".
    - Notifica o administrador: "Novo Lead Qualificado em Imbituba. Campanha sugerida: PRO Trial."

---

## ⚠️ Situação 03: Crise Operacional (WhatsApp Down)
**Estímulo**: A instância do WhatsApp (Evolution API) perde a conexão com o celular da pousada.

### Comportamento do Cérebro:
1.  **Monitoramento**: O serviço de pulso (heartbeat) detecta o status `DISCONNECTED`.
2.  **Triagem**: Verifica se o problema é no servidor ZEHLA ou no celular do cliente.
3.  **Ação Proativa**: 
    - Envia uma notificação PUSH/E-mail para o proprietário: "ZEHLA offline. Por favor, verifique o pareamento do WhatsApp para não perder reservas."
    - No Dashboard do Cliente, exibe um guia rápido de reconexão.
4.  **ZCC View**: O log mostra: "Instância Tenant_01 desconectada. Alerta enviado."

---

## 🔄 Situação 04: Tentativa de Abuso de Trial
**Estímulo**: O contato `marcio@teste.com` (que já usou um trial) tenta se cadastrar novamente.

### Comportamento do Cérebro:
1.  **Consulta à Memória**: Verifica na `TrialBlacklist` e na base `Secretaria-IA`.
2.  **Bloqueio Educativo**: Interrompe o registro instantaneamente.
3.  **Marketing Reverso**: Em vez de uma mensagem de erro fria, exibe: 
    - "Seu período expirou. **DEIXA COM ZEHLA!** Escolha um pacote e nos vemos no dashboard."
4.  **ZCC Insight**: "Conversão pendente detectada. Lead tentando re-entry."

---

## 🎯 Próximos Passos de Validação
1.  **Cadastro Completo**: Vamos criar uma conta real.
2.  **Dashboard Cliente**: Verificar se os 7 dias do plano PRO aparecem corretamente.
3.  **ZCC View**: Verificar se o novo cliente aparece no mapa de propriedades e no log cognitivo.
