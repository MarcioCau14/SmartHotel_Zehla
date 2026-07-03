# Design System

Este documento define os tokens visuais, componentes de interface, regras de espaçamento e padrões de animação do **Seu Zélla SmartHotel**.

## Visual Theme

### Color Palette
Utilizamos uma paleta de marca sóbria e focada em negócios:

*   **Canvas Background (Fundo)**: `#0a0a0d` (Preto profundo quente)
*   **Card Background (Superfície)**: `#121216` (Sólido opaco e escuro para alto contraste)
*   **Primary (Marca)**: Azul Royal (`#6488ff` / `#4169e1` - clareados para WCAG AA em telas escuras)
*   **Accent (Conversão e Destaques)**: Verde Esmeralda (`#10b981`) e Teal (`#14b8a6`)
*   **Text Main**: `#f8fafc` (Branco suave)
*   **Text Muted**: `#cbd5e1` (Cinza médio)
*   **Border Color**: `rgba(255, 255, 255, 0.08)` (Opacidade de 5% a 8% para integração harmônica)

### Typography
Estabelecemos um contraste de eixos tipográficos (serif + sans) para dar peso editorial às propostas e facilidade de leitura na UI:

*   **Display / Headings (h1–h4)**:
    *   **Font Family**: `Georgia, Garamond, serif`
    *   **Weight**: 800 (Extra Bold)
    *   **Letter Spacing**: `-0.02em` (Floor de `-0.04em` para evitar letras grudadas)
    *   **Feature**: `text-wrap: balance`
*   **Body / UI Text (Parágrafos e Inputs)**:
    *   **Font Family**: `system-ui, -apple-system, BlinkMacSystemFont, "Lucida Grande", sans-serif`
    *   **Size**: Mínimo `14px` (`text-sm`) para parágrafos ordinários e `16px` para leitura confortável.
    *   **Feature**: Line height de `1.6` para blocos de texto.

---

## Layout & Spacing
*   **Vertical Rhythm**: Espaçamentos verticais de seções padronizados em `py-24 sm:py-32`.
*   **Grids**: Uso de CSS Grid responsivo sem quebras: `repeat(auto-fit, minmax(280px, 1fr))`.
*   **Gaps**: Padronização em `gap-6` (24px) e `gap-8` (32px).

---

## Components

### Card
Componente básico de superfície para encapsular blocos de conteúdo e tabelas de planos:
```css
.card {
  background: #121216;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.2rem;
}
```

### Mockup Container
Utilizado para simular interfaces de conversas e painéis de controle do DDC:
```css
.mockup-container {
  background: #111115;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.55);
}
```

### Interactive Buttons
```css
.btn-primary {
  background: #1e3a8a; /* Azul escuro com contraste de 7.5:1 com texto branco */
  color: #ffffff;
  font-weight: bold;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.btn-primary:active {
  transform: scale(0.97);
}
```

---

## Motion
Adotamos animações discretas que auxiliam na compreensão do fluxo visual, sem criar distrações vazias:

*   **Biblioteca**: Framer Motion
*   **Propriedades**: Apenas `opacity` e deslocamentos de translação (`y`).
*   **Gatilho**: `useInView` com `once: true` para evitar re-animações de rolagem reversa.
