#!/usr/bin/env python3
"""
TECHDIM — FEED DE PRODUTOS DO GOOGLE MERCHANT CENTER
====================================================
Gera merchant-feed.xml (RSS 2.0 com atributos g:) a partir de:
  - loja.html: título, descrição e categoria de cada item (o feed precisa
    bater com a página de destino);
  - site-config.js (TECHDIM_CONFIG.loja): preço, foto e GTIN de cada item.

Só entram os itens da categoria "equipamento": o Google Shopping não aceita
serviços (política "Conteúdo não suportado no Shopping").
Item sem preço ou sem foto entra no feed mesmo assim; o Merchant Center
aponta o que falta em Produtos > Diagnóstico.

Uso:
  python3 scripts/gerar_feed_merchant.py            # grava merchant-feed.xml
  python3 scripts/gerar_feed_merchant.py --verificar  # sai com 1 se estiver desatualizado

Feed publicado: https://techdimbr.github.io/techdimbr/merchant-feed.xml
"""

import re
import sys
import pathlib
from html.parser import HTMLParser
from xml.sax.saxutils import escape

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SITE_URL = "https://techdimbr.github.io/techdimbr/"
SAIDA = RAIZ / "merchant-feed.xml"

# Dados que não aparecem na página. Categoria = ID da taxonomia do Google:
# https://www.google.com/basepages/producttype/taxonomy-with-ids.pt-BR.txt
# "identificadores": False = produto montado pela TECHDIM, sem GTIN nem MPN.
PRODUTOS = {
    "workstation-ia-ryzen9": {
        "marca": "TECHDIM", "categoria": "325", "tipo": "Computadores > Workstations para IA",
        "identificadores": False,
    },
    "kit-unifi-ubiquiti": {
        "marca": "Ubiquiti", "categoria": "342", "tipo": "Redes > Kits UniFi",
        "identificadores": True, "kit": True,
    },
    "pixel-11-pro-hardening": {
        "marca": "Google", "categoria": "267", "tipo": "Celulares > Celulares com hardening",
        "identificadores": True,
    },
    "thinkpad-l14-hardening": {
        "marca": "Lenovo", "categoria": "328", "tipo": "Computadores > Notebooks com hardening",
        "identificadores": True,
    },
    "midia-usb-debian-13": {
        "marca": "TECHDIM", "categoria": "3712", "tipo": "Software > Mídias de instalação Linux",
        "identificadores": False,
    },
}


class LeitorLoja(HTMLParser):
    """Extrai os itens (<article data-produto>) de loja.html."""

    def __init__(self):
        super().__init__()
        self.itens = []
        self.atual = None
        self.campo = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "article" and "data-produto" in a:
            self.atual = {"id": a["data-produto"], "categoria": a.get("data-categoria", ""),
                          "titulo": "", "desc": "", "inclui": []}
            self.itens.append(self.atual)
        elif self.atual is not None:
            if tag == "h2":
                self.campo = "titulo"
            elif tag == "p" and "loja-desc" in a.get("class", ""):
                self.campo = "desc"
            elif tag == "li":
                self.atual["inclui"].append("")
                self.campo = "inclui"

    def handle_endtag(self, tag):
        if tag == "article":
            self.atual = None
        if tag in ("h2", "p", "li"):
            self.campo = None

    def handle_data(self, data):
        if self.atual is None or self.campo is None:
            return
        if self.campo == "inclui":
            self.atual["inclui"][-1] += data
        else:
            self.atual[self.campo] += data


def ler_config_loja(texto):
    """Lê o bloco loja: { 'slug': { link: '', preco: '', ... } } do site-config.js."""
    bloco = re.search(r"\bloja\s*:\s*\{(.*?)\n\s*\}", texto, re.S)
    if not bloco:
        sys.exit("site-config.js: bloco 'loja' não encontrado")
    config = {}
    for slug, campos in re.findall(r"'([a-z0-9-]+)'\s*:\s*\{([^}]*)\}", bloco.group(1)):
        config[slug] = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", campos))
    return config


def preco_feed(texto):
    """'R$ 18.900,00' -> '18900.00 BRL'. Vazio -> ''."""
    if not texto.strip():
        return ""
    numero = re.sub(r"[^\d,.]", "", texto)
    if "," in numero:
        numero = numero.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"\d{1,3}(\.\d{3})+", numero):
        numero = numero.replace(".", "")  # "18.900" = dezoito mil e novecentos
    try:
        valor = float(numero)
    except ValueError:
        sys.exit(f"site-config.js: preço inválido '{texto}' (use o formato R$ 1.234,56)")
    if valor <= 0:
        sys.exit(f"site-config.js: preço deve ser maior que zero ('{texto}')")
    return f"{valor:.2f} BRL"


def url_absoluta(caminho):
    if caminho.startswith("https://"):
        return caminho
    return SITE_URL + caminho.lstrip("/")


def limpar(texto):
    return re.sub(r"\s+", " ", texto).strip()


def gerar():
    leitor = LeitorLoja()
    leitor.feed((RAIZ / "loja.html").read_text(encoding="utf-8"))
    config = ler_config_loja((RAIZ / "site-config.js").read_text(encoding="utf-8"))

    itens = []
    for item in leitor.itens:
        if item["categoria"] != "equipamento":
            continue
        meta = PRODUTOS.get(item["id"])
        if meta is None:
            sys.exit(f"Item '{item['id']}' da loja sem dados em PRODUTOS (scripts/gerar_feed_merchant.py)")
        cfg = config.get(item["id"], {})
        descricao = limpar(item["desc"])
        inclui = [limpar(i) for i in item["inclui"] if limpar(i)]
        if inclui:
            descricao += " Inclui: " + "; ".join(inclui) + "."

        campos = [
            ("g:id", item["id"]),
            ("g:title", limpar(item["titulo"])),
            ("g:description", descricao),
            ("g:link", f"{SITE_URL}loja.html#{item['id']}"),
        ]
        if cfg.get("imagem"):
            campos.append(("g:image_link", url_absoluta(cfg["imagem"])))
        campos.append(("g:availability", "in_stock"))
        if cfg.get("preco"):
            campos.append(("g:price", preco_feed(cfg["preco"])))
        campos += [
            ("g:condition", "new"),
            ("g:brand", meta["marca"]),
        ]
        if cfg.get("gtin"):
            campos.append(("g:gtin", re.sub(r"\D", "", cfg["gtin"])))
        if not meta["identificadores"]:
            campos.append(("g:identifier_exists", "no"))
        if meta.get("kit"):
            campos.append(("g:is_bundle", "yes"))
        campos += [
            ("g:google_product_category", meta["categoria"]),
            ("g:product_type", meta["tipo"]),
        ]
        linhas = "\n".join(f"      <{tag}>{escape(valor)}</{tag}>" for tag, valor in campos)
        itens.append(f"    <item>\n{linhas}\n    </item>")

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        "<!-- Gerado por scripts/gerar_feed_merchant.py a partir de loja.html e site-config.js. Não edite à mão. -->\n"
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
        "  <channel>\n"
        "    <title>Loja TECHDIM</title>\n"
        f"    <link>{SITE_URL}loja.html</link>\n"
        "    <description>Equipamentos com segurança aplicada vendidos pela TECHDIM</description>\n"
        + "\n".join(itens) + "\n"
        "  </channel>\n"
        "</rss>\n"
    )


if __name__ == "__main__":
    xml = gerar()
    if "--verificar" in sys.argv:
        atual = SAIDA.read_text(encoding="utf-8") if SAIDA.exists() else ""
        if atual != xml:
            sys.exit("merchant-feed.xml desatualizado: rode python3 scripts/gerar_feed_merchant.py")
        print("merchant-feed.xml em dia")
    else:
        SAIDA.write_text(xml, encoding="utf-8")
        print(f"merchant-feed.xml: {xml.count('<item>')} produto(s)")
