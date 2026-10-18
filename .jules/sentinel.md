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

## 2026-10-07 - Fix Reverse Tabnabbing and Referrer Leakage
**Vulnerability:** External links (both HTML `<a>` tags and programmatic `window.open` calls) lacked the `noreferrer` attribute in addition to `noopener`.
**Learning:** Even though `noopener` prevents reverse tabnabbing in most modern browsers, `noreferrer` is required for comprehensive protection (including legacy browsers) and prevents the destination site from tracking the origin of the traffic, which is a privacy and security best practice. Furthermore, `window.open` is equally vulnerable and must use `'noopener,noreferrer'` in its features string.
**Prevention:** Always use `rel="noopener noreferrer"` for HTML anchor tags that open in a new tab (`target="_blank"`). For programmatic navigation, ensure `window.open(url, '_blank', 'noopener,noreferrer')` is used instead of just passing `_blank`.
