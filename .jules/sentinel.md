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

## 2026-10-12 - [Security Enhancement] Prevent Reverse Tabnabbing and Referrer Leakage
**Vulnerability:** External links created via `window.open` in JS and some anchor tags with `target="_blank"` lacked complete protection against reverse tabnabbing and referrer information leakage.
**Learning:** While `target="_blank"` is common, it allows the newly opened tab to access the original page's `window.opener` object (which can be exploited to redirect the original tab to a malicious site). It also leaks the referrer URL by default.
**Prevention:** Always include `rel="noopener noreferrer"` for `<a>` tags with `target="_blank"`. For programmatic navigation using `window.open`, pass `'noopener,noreferrer'` as the third argument (window features).
