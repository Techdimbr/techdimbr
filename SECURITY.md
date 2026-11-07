# Security Policy / Política de Segurança (ISO/IEC 29147 & LGPD)

[![Security Standard](https://img.shields.io/badge/Security-ISO%2FIEC%2029147-critical)](https://github.com/Techdimbr/techdimbr/security)
[![LGPD Compliance](https://img.shields.io/badge/Compliance-LGPD%20%2F%20GDPR-blue)](https://techdim.com.br)
[![Zero Trust](https://img.shields.io/badge/Architecture-Zero%20Trust-success)](https://techdim.com.br)

## 🇧🇷 Diretrizes de Segurança e Divulgação Responsável

O repositório **`techdimbr`** é mantido sob a governança de engenharia e cibersegurança da **TECHDIM INOVA SIMPLES (I.S.) — ME** (Liderança Técnica: **Eng. Deivis Irio Mayer**), seguindo os controles internacionais **ISO/IEC 27001**, **ISO/IEC 29147 (Vulnerability Disclosure)**, **CIS Benchmarks** e a **Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)**.

### 1. Versões Suportadas (Supported Versions)

| Versão / Branch | Status de Suporte | Auditoria SAST / Dependabot |
| :--- | :---: | :---: |
| `main` (HEAD) | ✅ Suporte Ativo (SLA Crítico) | ✅ Ativo |
| `releases >= 1.0` | ✅ Patches de Segurança | ✅ Ativo |
| `< 1.0` (Legado) | ❌ Não Suportado | ⚠️ Somente Leitura |

### 2. Como Reportar uma Vulnerabilidade (Reporting a Vulnerability)

**NUNCA reporte vulnerabilidades de segurança em Issues públicas.**

1. Utilize a aba oficial **[Security Advisories](https://github.com/Techdimbr/techdimbr/security/advisories/new)** do GitHub para submissão criptografada e privada.
2. Alternativamente, envie um relatório técnico detalhado pelo portal institucional **[https://techdim.com.br](https://techdim.com.br)** contendo:
   - Vetor de ataque, escopo afetado e estimativa de severidade (**CVSS v3.1 / v4.0**).
   - Passos determinísticos para reprodução (Proof of Concept — PoC).
   - Sugestão de mitigação ou patch corretivo.

### 3. SLA de Resposta a Incidentes

| Severidade (CVSS) | Confirmação de Recebimento | Triagem Técnica | Mitigação / Patch |
| :--- | :---: | :---: | :---: |
| **Crítica (9.0 – 10.0)** | Até 24h | Até 48h | Até 72h |
| **Alta (7.0 – 8.9)** | Até 48h | Até 5 dias úteis | Até 10 dias úteis |
| **Média / Baixa (< 7.0)** | Até 5 dias úteis | Próxima Sprint | Próxima Release |

### 4. Controles Soberanos Kether_1 Aplicados
- **Zero Plaintext Secrets**: Proibição estrita de credenciais, chaves de API (`GEMINI_API_KEY`, `GITHUB_TOKEN`, chaves privadas) no código-fonte.
- **Least Privilege & Sandboxing**: Execução isolada e validação estrita de entradas contra injeções (XSS, SQLi, SSRF, Path Traversal e Command Injection).

---

## 🌐 English Summary — Responsible Vulnerability Disclosure

**`techdimbr`** follows **ISO/IEC 29147**, **OpenSSF Best Practices**, and **Zero-Trust DevSecOps** guidelines maintained by **TECHDIM INOVA SIMPLES** (**Eng. Deivis Irio Mayer**).

- **Do not open public issues for security vulnerabilities.**
- Submit findings privately via **[GitHub Security Advisories](https://github.com/Techdimbr/techdimbr/security/advisories/new)** or via **[https://techdim.com.br](https://techdim.com.br)**.
- Critical vulnerabilities receive initial triage within **24–48 hours**.
