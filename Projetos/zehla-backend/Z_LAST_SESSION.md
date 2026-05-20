# 🏁 Checkpoint: Zehla Smarthotel - Sessão Atualizada (29/04/2026)

Este arquivo registra o estado atual do projeto, comandos de inicialização e caminhos para evitar retrabalho e garantir que a sessão continue exatamente de onde parou.

## 📍 Onde Estamos
- **Ambiente Docker**: Operacional com Postgres, Redis e Evolution API.
- **Servidor Next.js**: Rodando em modo de desenvolvimento (`npm run dev`).
- **Visualização Unificada (Split-View)**: Funcional em `http://localhost:3000/split-view.html`.

## 🛠️ Comandos de Inicialização (Como retomar)
Caso o sistema seja reiniciado, execute os seguintes passos na raiz do projeto (`/Users/marciocau/zehla-backend`):

1.  **Subir Banco e Serviços (Docker):**
    ```bash
    docker compose up -d
    ```
2.  **Iniciar Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
3.  **Abrir Painel de Testes:**
    ```bash
    open http://localhost:3000/split-view.html
    ```

## 📂 URLs e Rotas Importantes
*   **Split-View (3 em 1):** `http://localhost:3000/split-view.html`
*   **Página de Vendas:** `/`
*   **ZCC Admin:** `/zcc-login` (Redireciona para `/zcc` após login)
*   **Dashboard do Cliente:** `/login` (Redireciona para `/dashboard` após login)

## 🔑 Credenciais de Teste (Pré-preenchidas no código)
*   **ZCC Admin:**
    *   *Login:* `admin@smarthotel.com`
    *   *Senha:* `zehla2026`
*   **Dashboard do Cliente:**
    *   *Login:* `maria@pousadadosol.com.br`
    *   *Senha:* `pousada123`

## 🚀 Próximos Passos
1.  Testar o fluxo de clique nos botões de login dentro do Split-View.
2.  Iniciar as alterações solicitadas na página de vendas, ZCC e dashboard.
3.  Criar novos endpoints conforme a necessidade do negócio.

---
**Última Atualização:** 29 de Abril de 2026 às 11:40 (Horário Local)  
**Status:** Ambiente pronto e documentado.
