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
## 2026-10-15 - [Reverse Tabnabbing and Referrer Leakage]
**Vulnerability:** External links opened via `window.open` in JS and some `target="_blank"` anchor tags were missing `noopener,noreferrer` attributes.
**Learning:** This exposes the application to Reverse Tabnabbing (where the newly opened tab can manipulate the opener's location) and leaks referrer information unnecessarily. Modern browsers auto-apply `noopener` to anchor tags, but it is not consistently applied to `window.open` calls across all environments.
**Prevention:** Always append `'noopener,noreferrer'` to the third argument of `window.open` when navigating to external domains, and include `rel="noopener noreferrer"` on all `<a target="_blank">` tags.
