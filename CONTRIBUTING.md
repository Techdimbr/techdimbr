# Guia de Contribuição e Padrões de Engenharia / Contributing Guide

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/)
[![Semantic Versioning](https://img.shields.io/badge/SemVer-2.0.0-blue)](https://semver.org/)

Bem-vindo ao guia oficial de engenharia e contribuição do repositório **`techdimbr`** (**TECHDIM INOVA SIMPLES** — **Eng. Deivis Irio Mayer**).

---

## 1. Fluxo de Engenharia (GitHub Flow & Clean Architecture)

1. **Issues Primeiro**: Toda nova funcionalidade, correção de bug ou decisão arquitetural (ADR) deve estar vinculada a uma **Issue estruturada** utilizando nossos formulários oficiais em `.github/ISSUE_TEMPLATE/`.
2. **Branches Semânticas**:
   - `feat/<escopo>-<descricao>`: Novas funcionalidades.
   - `fix/<escopo>-<descricao>`: Correções de bugs ou regressões.
   - `sec/<escopo>-<descricao>`: Hardening de segurança e mitigação de vulnerabilidades.
   - `docs/<escopo>-<descricao>`: Evolução de documentação técnica ou ADRs.
3. **Conventional Commits (Obrigatório)**:
   - `feat(core): implement deterministic validation pipeline`
   - `fix(security): sanitize DOM input against XSS vectors`
   - `docs(adr): document zero-trust architecture trade-offs`
   - `chore(deps): update runtime dependencies`

---

## 2. Requisitos de Qualidade (Quality Gates) antes do Pull Request

- [ ] **Zero Segredos Expostos**: Nenhum arquivo `.env`, token ou chave privada pode ser incluído no commit.
- [ ] **Portabilidade e Segurança**: Scripts Bash devem iniciar com `set -euo pipefail` e documentar procedimento de *rollback*.
- [ ] **Verificação Estática e Testes**: Garanta que os linters, testes automatizados e verificações de tipagem (`pytest`, `npm run lint`, `tsc`, `shellcheck`) passem com **0 erros**.
- [ ] **Acessibilidade e Performance**: Alterações de interface devem respeitar **WCAG 2.1 AA** (atributos ARIA, contraste, navegação por teclado) e orçamento de performance.

---

## 🌐 English Summary

1. Open an Issue using our structured **YAML Issue Forms** before submitting major changes.
2. Follow **Conventional Commits 1.0.0** and **Semantic Versioning 2.0.0**.
3. Ensure all automated CI/CD checks, SAST security scans, and unit tests pass prior to requesting review from `@Techdimbr`.
