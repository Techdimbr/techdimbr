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

## 2026-10-16 - Reverse Tabnabbing and Referrer Leakage
**Vulnerability:** External links (`target="_blank"`) and `window.open` calls lacked `noreferrer` protection, creating risk of reverse tabnabbing (malicious sites manipulating the original tab's `window.opener`) and referrer information leakage.
**Learning:** `rel="noopener"` or `'noopener'` alone isn't sufficient for comprehensive security; `noreferrer` is required to prevent leaking the originating URL (which might contain sensitive session IDs or tokens) in the `Referer` header.
**Prevention:** Always use both `noopener` and `noreferrer` together (`rel="noopener noreferrer"` in HTML, `'noopener,noreferrer'` in `window.open`) when linking to or opening external untrusted domains.
