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

## 2026-10-06 - Prevenção de Reverse Tabnabbing e DOM XSS
**Vulnerability:** Uso de `window.open` sem o atributo `noreferrer` vazava referrers (e abria brechas para Reverse Tabnabbing) e uso de `innerHTML` concatenado com inputs/dados para preencher listas (`#modalServiceList`) no modal criava risco de DOM XSS.
**Learning:** Sempre que usar `window.open` programaticamente, os atributos `noopener,noreferrer` são essenciais. Além disso, elementos do DOM que refletem conteúdo da aplicação (mesmo dados aparentemente seguros) devem usar métodos seguros de renderização como `.createElement()` em conjunto com `.textContent` em vez de injeção crua via `innerHTML`.
**Prevention:** Padronizar todas as chamadas `window.open` para incluírem `'noopener,noreferrer'` e banir o uso de `innerHTML` dinâmico em favor de criação de nós de texto seguros no DOM, mesmo para conteúdo local, fortalecendo a Defesa em Profundidade.
