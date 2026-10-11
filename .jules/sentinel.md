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

## 2026-10-11 - Add noreferrer to target="_blank" links
**Vulnerability:** External links (both HTML and window.open) used `rel="noopener"` or `'_blank'` without `noreferrer`, exposing the Referer header to external sites and risking reverse tabnabbing.
**Learning:** While `noopener` prevents the new tab from accessing `window.opener` in most modern browsers, it still sends the Referer header. Adding `noreferrer` is a best practice to ensure complete separation and prevent information leakage.
**Prevention:** Always use `rel="noopener noreferrer"` for HTML links and `'noopener,noreferrer'` for `window.open` calls with `_blank`.
