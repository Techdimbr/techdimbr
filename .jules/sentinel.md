# 🛡️ Diretrizes de Engenharia e Segurança do Agente Jules AI (Techdim)

## Regras Invioláveis do Projeto:
1. **Identidade Visual e Marca:**
   - Manter a paleta de cores Cyberpunk Tático B2B (Fundo escuro `#030712`, Ciano neon `#00ffcc`, Azul `#0077ff`, Laranja de aviso `#ff5500`).
   - Logotipo oficial: `assets/techdim-official-logo.png`.
2. **Dados Oficiais de Contato:**
   - WhatsApp Comercial & Suporte: `(19) 99615-3276` (Link: `https://wa.me/5519996153276`).
   - E-mail institucional: `techdimbrasil@gmail.com`.
   - CNPJ Oficial: `61.933.926/0001-24`.
3. **Padrões de Acessibilidade & Desempenho:**
   - Manter conformidade com WCAG 2.1 (foco visível, navegação por teclado, labels descritivos).
   - Preservar suporte a `@media (prefers-reduced-motion: reduce)`.
   - Garantir que todos os links externos possuam `rel="noopener noreferrer"`.
4. **Deploy e Compatibilidade:**
   - O site roda estático no GitHub Pages. Não adicionar dependências ou rotas de backend dinâmico que quebrem o GitHub Pages.
## 2026-10-10 - [Missing noreferrer in External Links and window.open]
**Vulnerability:** External links (in HTML and via JavaScript's `window.open`) were missing the `noreferrer` attribute/parameter, which could lead to referrer leakage. The `window.open` calls were also missing `noopener`.
**Learning:** Even if `rel="noopener"` is present in HTML, `noreferrer` is needed to prevent leaking sensitive URLs or user flow data to external sites. Also, `window.open` using `_blank` is vulnerable to Reverse Tabnabbing and referrer leakage if the window features `noopener,noreferrer` are not explicitly specified.
**Prevention:** Always verify that `rel="noopener noreferrer"` is used in external `href` tags. When opening new tabs via JavaScript, always explicitly provide `noopener,noreferrer` as the window feature string.
