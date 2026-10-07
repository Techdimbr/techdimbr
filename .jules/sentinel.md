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

## YYYY-MM-DD - [Prevenção contra Reverse Tabnabbing]
**Vulnerability:** Abertura de janelas e abas externas sem isolamento do contexto de navegação original (falta de `rel="noopener noreferrer"` no HTML e opções em `window.open`).
**Learning:** Mesmo em projetos frontend Vanilla JS, funções nativas como `window.open()` deixam a aplicação exposta a ataques de Reverse Tabnabbing e referrer leakage se não configuradas corretamente.
**Prevention:** Sempre usar `rel="noopener noreferrer"` em tags `<a>` externas e incluir o parâmetro de opções `'noopener,noreferrer'` em chamadas `window.open()`.
