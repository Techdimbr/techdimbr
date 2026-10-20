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

## 2024-03-24 - [DOM XSS and Reverse Tabnabbing Mitigations]
**Vulnerability:** Use of innerHTML for dynamically rendering lists, creating DOM XSS risk. Missing noreferrer on window.open.
**Learning:** Even statically controlled data like SITE_CONFIG can be exploited if intercepted. It's safer to always use textContent and appendChild. In addition, external links opened via window.open need noreferrer to prevent the new tab from accessing window.opener and potentially redirecting the original page (Reverse Tabnabbing).
**Prevention:** Use document.createElement + textContent for DOM injections and always include 'noopener,noreferrer' in window.open calls.
