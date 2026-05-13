# Guia de Operações: SmartHotel / Zehla

Este documento explica como operar o projeto, gerir o código e disparar automações de forma eficiente.

## 1. Operando o Motor de Automação (Safari)

O "motor" foi projetado para ser leve no seu iMac e poderoso no GitHub.

### Como criar uma nova automação (Receita):
1. Vá até a pasta `zehla-backend/automation/recipes/`.
2. Crie um novo arquivo `.ts` (ex: `coletar-leads.ts`).
3. Siga o modelo da receita `google-test.ts`.

### Como testar localmente (Economizando minutos):
No terminal, dentro da pasta `zehla-backend`, rode:
```bash
npx tsx scripts/browser-task.ts nome-da-sua-receita
```
*Isso usará o motor do Safari localmente. É rápido e não consome minutos do GitHub.*

### Como rodar na nuvem (GitHub Actions):
1. Faça o `git push` das suas novas receitas para o repositório.
2. Vá na aba **Actions** do seu GitHub.
3. Escolha **ZEHLA Browser Executor (Safari)**.
4. Clique em **Run workflow**, digite o nome da receita e execute.

---

## 2. Gestão de Código "Daqui para Lá"

### Enviando alterações para o GitHub:
Sempre que fizer mudanças, use os comandos padrão do git:
```bash
git add .
git commit -m "Descrição da sua mudança"
git push origin main
```

### Monitorando builds:
O workflow **ZEHLA CI/CD Pipeline** roda automaticamente a cada push para garantir que o código está íntegro e pronto para produção.

---

## 3. Dicas de Otimização para o iMac

- **Use Webkit:** O projeto está configurado para priorizar o Webkit (Safari). Evite rodar o Chromium ou o Chrome se possível.
- **Headless Mode:** Por padrão, o motor roda sem abrir janelas. Se quiser ver o navegador abrindo para debugar localmente, mude `headless: true` para `false` no arquivo `scripts/browser-task.ts`.
- **Filtros de Rede:** Nas suas receitas, você pode bloquear o carregamento de imagens e CSS pesado para tornar o robô 10x mais rápido.

---

## 3. Gestão de Nuvem (Estratégia Custo Zero)

Para manter o ZEHLA operando 24/7 sem depender do iMac ligado, seguimos o fluxo:

### Configuração do Banco de Dados (Supabase):
1. Crie um projeto no **Supabase** (Gratuito).
2. Obtenha a `Connection String` e adicione ao seu arquivo `.env`:
   - `DATABASE_URL`: Use a versão com "Connection Pooling" (porta 6543).
   - `DIRECT_URL`: Use a conexão direta para migrações (porta 5432).

### Deploy na Vercel:
1. Conecte seu repositório GitHub à **Vercel**.
2. Adicione os Segredos (Secrets) na aba de configurações da Vercel (copie as variáveis do seu `.env`).
3. O deploy será automático a cada `git push origin main`.

---

## 4. Agentes de Elite: Jony, Maria e Tedd

Os agentes financeiros agora podem ser consultados via Chat ou disparados via automação.

- **Jony:** Verifique o status diário no dashboard ou via comando `agent-sync`.
- **Maria:** Use para auditorias quinzenais. Ela investigará discrepâncias automaticamente.
- **Tedd:** Consulte para projeções mensais. Ele trará os dados do motor preditivo xVal.

**Comando de Sincronização:**
```bash
npx tsx scripts/browser-task.ts agent-sync
```

---

## 5. Segurança e Isolamento

O ZEHLA agora possui **Isolamento de Missão Crítica**:
- **Admin SmartHotel:** Apenas via `/zcc`.
- **Área do Hoteleiro:** Apenas via `/dashboard`.
- **Proteção:** O Middleware bloqueia acessos cruzados automaticamente. Jamais remova o `src/middleware.ts`.
