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

## 2025-02-20 - Reverse Tabnabbing Vulnerability
**Vulnerability:** Reverse Tabnabbing and Referrer Leakage due to missing `noopener,noreferrer` on external links and programmatic `window.open` calls.
**Learning:** `window.open` calls with `_blank` target need `noopener,noreferrer` arguments just like HTML `<a>` tags with `target="_blank"`. Without it, the new tab can access the original window's `window.opener` object and leak referrer information.
**Prevention:** Always include `'noopener,noreferrer'` as the third argument to `window.open(url, '_blank')` and `rel="noopener noreferrer"` on `<a>` tags with `target="_blank"`.
