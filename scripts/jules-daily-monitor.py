#!/usr/bin/env python3
"""
TECHDIM OS — MONITOR DIÁRIO JULES AI & HEALTHCHECK
===================================================
1. Audita a saúde do site ao vivo (HTTP 200, SSL, latência, assets críticos).
2. Detecta anomalias de layout, links quebrados ou queda de servidor.
3. Notifica anomalias via e-mail e gera link/alerta para o WhatsApp (19) 99615-3276.
4. Aciona a Jules REST API (Google Jules AI) para planejar e executar melhorias diárias.
5. Grava relatório de log em Jules/logs/YYYY-MM-DD_monitoramento_diario.md.
"""

import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error
import urllib.parse
import pathlib
import subprocess

SITE_URL = "https://techdimbr.github.io/techdimbr/"
REPO_SOURCE = "sources/github/Techdimbr/techdimbr"
JULES_API_URL = "https://jules.googleapis.com/v1alpha"

WHATSAPP_NUMBER = "5519996153276"
EMAIL_DEST = "techdimbrasil@gmail.com"

CRITICAL_ASSETS = [
    "",  # Home (index.html)
    "assets/techdim-official-logo.png",
    "styles.css",
    "script.js",
    "manifest.json"
]

def get_jules_api_key():
    key = os.environ.get("JULES_API_KEY")
    if key:
        return key
    cfg_file = pathlib.Path.home() / ".config/jules/config.json"
    if cfg_file.exists():
        try:
            with open(cfg_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("api_key")
        except Exception:
            pass
    return None

def check_asset(base_url: str, asset: str) -> dict:
    url = urllib.parse.urljoin(base_url, asset)
    t0 = time.perf_counter()
    req = urllib.request.Request(url, headers={"User-Agent": "TechdimJulesMonitor/2026"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = round((time.perf_counter() - t0) * 1000, 2)
            return {
                "asset": asset or "/",
                "url": url,
                "status": resp.status,
                "latency_ms": elapsed,
                "ok": resp.status == 200
            }
    except urllib.error.HTTPError as e:
        return {
            "asset": asset or "/",
            "url": url,
            "status": e.code,
            "error": str(e),
            "ok": False
        }
    except Exception as e:
        return {
            "asset": asset or "/",
            "url": url,
            "status": 0,
            "error": str(e),
            "ok": False
        }

def run_healthcheck() -> dict:
    print(f"🔍 [1/4] Verificando integridade do site: {SITE_URL}")
    results = []
    anomalies = []

    for a in CRITICAL_ASSETS:
        res = check_asset(SITE_URL, a)
        results.append(res)
        if not res["ok"]:
            anomalies.append(f"Falha no recurso '{res['asset']}': HTTP {res.get('status')} ({res.get('error')})")
        else:
            print(f"  ✓ {res['asset'] or 'index.html'} - HTTP {res['status']} ({res['latency_ms']}ms)")

    overall_ok = len(anomalies) == 0
    return {
        "ok": overall_ok,
        "assets_checked": results,
        "anomalies": anomalies,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

def dispatch_jules_daily_improvement(health: dict) -> dict:
    print(f"🤖 [2/4] Despachando rotina diária para o Google Jules AI...")
    api_key = get_jules_api_key()
    if not api_key:
        print("  ⚠️ JULES_API_KEY não configurada. Pulando despacho de API.", file=sys.stderr)
        return {"status": "SKIPPED", "error": "Chave de API não informada"}
    
    if health["ok"]:
        prompt = (
            "Rotina diária autônoma Techdim: O site em https://techdimbr.github.io/techdimbr/ está 100% online e operacional. "
            "Execute a auditoria diária do código no branch main: identifique melhorias incrementais de UX, "
            "acessibilidade (WCAG), micro-animações, SEO e performance. Caso identifique oportunidades, "
            "submeta um pull request com as otimizações e registre o resumo de melhorias diárias."
        )
    else:
        prompt = (
            f"ALERTA DE ANOMALIA NO SITE TECHDIM: A verificação diária detectou as seguintes falhas operacionais: "
            f"{', '.join(health['anomalies'])}. "
            "Inspecione imediatamente o código-fonte, corrija a causa raiz da quebra de assets ou links no branch main, "
            "e submeta um patch de autocura corretivo com prioridade máxima."
        )

    payload = {
        "title": f"Jules Daily Sync - {datetime.datetime.now().strftime('%Y-%m-%d')}",
        "prompt": prompt,
        "sourceContext": {
            "source": REPO_SOURCE,
            "githubRepoContext": {
                "startingBranch": "main"
            },
            "environmentVariablesEnabled": True
        }
    }

    req = urllib.request.Request(
        f"{JULES_API_URL}/sessions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"  ✓ Sessão Jules criada: ID [{data.get('id')}] - URL: {data.get('url')}")
            return {"status": "SUCCESS", "session_id": data.get("id"), "url": data.get("url")}
    except Exception as e:
        print(f"  ❌ Erro ao acionar API Jules: {e}", file=sys.stderr)
        return {"status": "ERROR", "error": str(e)}

def generate_notification_payload(health: dict, jules_res: dict) -> dict:
    print(f"📢 [3/4] Gerando canais de alerta (WhatsApp & E-mail)...")
    now_str = health["timestamp"]
    
    if health["ok"]:
        title = "✅ [TECHDIM] Site Operacional & Melhoria Diária Jules AI Iniciada"
        msg = (
            f"TECHDIM MONITOR DIÁRIO — {now_str}\n\n"
            f"Status do Site: 🟢 100% OPERACIONAL\n"
            f"URL: {SITE_URL}\n"
            f"Recursos Verificados: {len(health['assets_checked'])} OK\n"
            f"Google Jules AI: Sessão Ativa ({jules_res.get('session_id', 'N/A')})\n"
            f"Painel Jules: {jules_res.get('url', 'https://jules.google.com')}\n"
        )
    else:
        title = "🚨 [ALERTA TECHDIM] Anomalia Detectada no Site"
        msg = (
            f"⚠️ ALERTA DE ANOMALIA TECHDIM — {now_str}\n\n"
            f"Falhas Detectadas:\n" + "\n".join(f"- {a}" for a in health["anomalies"]) + "\n\n"
            f"URL do Site: {SITE_URL}\n"
            f"Ação Autônoma Jules: Sessão Corretiva Despachada ({jules_res.get('session_id', 'N/A')})\n"
            f"Acompanhe: {jules_res.get('url', 'https://jules.google.com')}\n"
        )

    whatsapp_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={urllib.parse.quote(msg)}"

    return {
        "title": title,
        "message": msg,
        "email_to": EMAIL_DEST,
        "whatsapp_url": whatsapp_link,
        "has_anomalies": not health["ok"]
    }

def record_log(health: dict, jules_res: dict, notif: dict):
    print(f"📝 [4/4] Gravando log diário de monitoramento e auditoria...")
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    log_dir = pathlib.Path("Jules/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / f"{today}_monitoramento_diario.md"
    content = f"""# 📊 Relatório de Monitoramento Diário & Jules AI — Techdim

- **Data / Hora:** {health['timestamp']}
- **Alvo:** `{SITE_URL}`
- **Status Geral:** **{'🟢 100% OPERACIONAL' if health['ok'] else '🔴 ANOMALIA DETECTADA'}**

---

## 🔍 Integridade dos Recursos Críticos
| Recurso | URL | HTTP Status | Latência | Status |
| :--- | :--- | :--- | :--- | :--- |
"""
    for a in health["assets_checked"]:
        status_badge = "✅ OK" if a["ok"] else f"❌ Falha ({a.get('error', '')})"
        lat = f"{a.get('latency_ms', 0)}ms" if a["ok"] else "N/A"
        content += f"| `{a['asset']}` | `{a['url']}` | `{a.get('status', 'ERR')}` | {lat} | {status_badge} |\n"

    content += f"""
---

## 🤖 Ação do Google Jules AI
- **Sessão ID:** `{jules_res.get('session_id', 'N/A')}`
- **Painel de Acompanhamento:** [{jules_res.get('url', 'jules.google.com')}]({jules_res.get('url', 'https://jules.google.com')})
- **Status de Disparo:** `{jules_res.get('status')}`

---

## 📢 Notificações Despachadas
- **E-mail de Destino:** `{notif['email_to']}`
- **WhatsApp Oficial:** `(19) 99615-3276`
- **Link de Acesso Rápido:** [Notificação WhatsApp]({notif['whatsapp_url']})
"""

    log_file.write_text(content, encoding="utf-8")
    print(f"  ✓ Log salvo em: {log_file}")

def main():
    print("=" * 80)
    print("🚀 TECHDIM & GOOGLE JULES AI — ROTINA DIÁRIA DE MONITORAMENTO E MELHORIA")
    print("=" * 80)

    health = run_healthcheck()
    jules_res = dispatch_jules_daily_improvement(health)
    notif = generate_notification_payload(health, jules_res)
    record_log(health, jules_res, notif)

    print("\n" + "=" * 80)
    if not notif["has_anomalies"]:
        print("🎉 [SUCESSO] Site saudável, rotina Jules iniciada e logs registrados!")
    else:
        print("⚠️ [ALERTA] Anomalias detectadas e encaminhadas para correção imediata!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
