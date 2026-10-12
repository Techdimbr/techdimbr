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

## 2026-10-12 - [Programmatic Reverse Tabnabbing via window.open]
**Vulnerability:** External links opened programmatically via `window.open()` were lacking `'noopener,noreferrer'` features, exposing the application to Reverse Tabnabbing.
**Learning:** While HTML anchor tags (`<a target="_blank">`) are often secured with `rel="noopener noreferrer"`, it is easy to overlook equivalent programmatic link openings in JavaScript. The `window.open` function can leave the window reference intact.
**Prevention:** Always include `'noopener,noreferrer'` as the third argument (windowFeatures) whenever using `window.open()` to redirect or open a new window to an external domain.
