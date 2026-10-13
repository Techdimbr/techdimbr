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
## 2026-10-13 - [Preventing Reverse Tabnabbing and Referrer Leakage]
**Vulnerability:** External links opened via `target="_blank"` missing `rel="noopener noreferrer"`, and programmatic `window.open` calls missing the `'noopener,noreferrer'` features string.
**Learning:** This repo lacked strict enforcement of the `noreferrer` attribute across all external links and `window.open` programmatic usages, allowing potential referer leakage to third parties and reverse tabnabbing vulnerability where a malicious site could overwrite the source document.
**Prevention:** All external link tags must strictly enforce `rel="noopener noreferrer"`. Also, dynamically generated external links with `window.open` in JavaScript must include `'noopener,noreferrer'` as the 3rd argument.
