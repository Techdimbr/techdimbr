#!/usr/bin/env python3
"""
TECHDIM — FEED DE PRODUTOS DO GOOGLE MERCHANT CENTER
====================================================
Gera merchant-feed.xml (RSS 2.0 com atributos g:) a partir de:
  - loja.html: título, descrição e categoria de cada item (o feed precisa
    bater com a página de destino);
  - site-config.js (TECHDIM_CONFIG.loja): preço, foto e GTIN de cada item.

Só entram os itens da categoria "equipamento". Serviço não pode entrar, nem com
preço fixo: "Não são permitidos trabalho, tempo, esforço, experiência ou ações
que não resultem na propriedade de um produto tangível" (política "Conteúdo não
compatível com o Shopping", support.google.com/merchants/answer/6150006). O item
é reprovado e, se continuar no feed depois do aviso, a conta pode ser suspensa.
Um equipamento só entra no feed quando está pronto para ser aprovado: preço,
foto real e link de compra (plataforma de venda ou link de pagamento) em
site-config.js. O Merchant exige preço fixo e compra pelo site, e um item
incompleto só gera reprovação e expõe a conta à revisão. O motivo de cada item
que ficou de fora aparece na saída do script (e no log do GitHub Actions).

Uso:
  python3 scripts/gerar_feed_merchant.py            # grava merchant-feed.xml
  python3 scripts/gerar_feed_merchant.py --verificar  # sai com 1 se estiver desatualizado

Feed publicado: https://techdimbr.github.io/techdimbr/merchant-feed.xml
"""

import pathlib
import re
import sys
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
        "identificadores": True,
        # A página vende o kit "instalado": serviço junto com produto é proibido
        # no Merchant. Venda o kit como equipamento e a instalação à parte, ajuste
        # loja.html e apague esta linha.
        "bloqueio": "a página inclui instalação (serviço junto com o produto)",
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
    """Lê o bloco loja: { 'slug': { link: '', preco: '', ... } } do site-config.js.
    Aceita aspas simples ou duplas e entradas em várias linhas."""
    inicio = re.search(r"\bloja\s*:\s*\{", texto)
    if not inicio:
        sys.exit("site-config.js: bloco 'loja' não encontrado")
    nivel, fim = 1, inicio.end()
    while nivel and fim < len(texto):
        nivel += {"{": 1, "}": -1}.get(texto[fim], 0)
        fim += 1
    bloco = texto[inicio.end():fim - 1]
    config = {}
    for _, slug, campos in re.findall(r"(['\"])([a-z0-9-]+)\1\s*:\s*\{(.*?)\}", bloco, re.DOTALL):
        config[slug] = {chave: valor for chave, _, valor in re.findall(r"(\w+)\s*:\s*(['\"])(.*?)\2", campos, re.DOTALL)}
    if not config:
        sys.exit("site-config.js: nenhum item lido no bloco 'loja' (formato inesperado)")
    return config


def preco_feed(texto):
    """'R$ 18.900,00' -> '18900.00 BRL'. Vazio -> ''.
    Só aceita um valor: texto como "a partir de" ou "12x" faria o feed divergir da página."""
    texto = texto.replace("\u00a0", " ").strip()
    if not texto:
        return ""
    numero = re.sub(r"^R\$\s*", "", texto)
    if re.fullmatch(r"\d{1,3}(\.\d{3})*(,\d{1,2})?|\d+(,\d{1,2})?", numero):
        valor = float(numero.replace(".", "").replace(",", "."))
    elif re.fullmatch(r"\d+\.\d{1,2}", numero):
        valor = float(numero)
    else:
        sys.exit(f"site-config.js: preço inválido '{texto}' (use só o valor, no formato R$ 1.234,56)")
    if valor <= 0:
        sys.exit(f"site-config.js: preço deve ser maior que zero ('{texto}')")
    return f"{valor:.2f} BRL"


def url_imagem(caminho, slug):
    """Foto em https:// ou caminho de um arquivo que existe no repositório."""
    if caminho.startswith("https://"):
        return caminho
    if re.match(r"^[a-z]+:", caminho, re.IGNORECASE):
        sys.exit(f"site-config.js: imagem de '{slug}' precisa ser https:// ou um arquivo do site ('{caminho}')")
    if not (RAIZ / caminho.lstrip("/")).is_file():
        sys.exit(f"site-config.js: imagem de '{slug}' não existe no repositório ('{caminho}')")
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
        meta = PRODUTOS.get(item["id"], {})
        cfg = config.get(item["id"], {})
        faltando = [nome for nome, ok in (
            ("preço", cfg.get("preco")), ("foto", cfg.get("imagem")),
            ("link de compra", (cfg.get("link") or "").startswith("https://")),
        ) if not ok]
        if meta.get("bloqueio") or faltando:
            motivo = meta.get("bloqueio") or "falta " + ", ".join(faltando)
            print(f"fora do feed: {item['id']} ({motivo})")
            continue
        if not meta:
            sys.exit(f"Equipamento '{item['id']}' pronto para o feed, mas sem marca e categoria em PRODUTOS "
                     "(scripts/gerar_feed_merchant.py)")
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
        campos += [
            ("g:image_link", url_imagem(cfg["imagem"], item["id"])),
            ("g:availability", "in_stock"),
            ("g:price", preco_feed(cfg["preco"])),
        ]
        campos += [
            ("g:condition", "new"),
            ("g:brand", meta["marca"]),
        ]
        if cfg.get("gtin"):
            gtin = re.sub(r"[\s-]", "", cfg["gtin"])
            if not re.fullmatch(r"\d{8}|\d{12,14}", gtin):
                sys.exit(f"site-config.js: GTIN de '{item['id']}' inválido ('{cfg['gtin']}'): use 8, 12, 13 ou 14 dígitos")
            campos.append(("g:gtin", gtin))
        elif meta["identificadores"]:
            print(f"aviso: {item['id']} sem GTIN; o Google limita o alcance de produto de marca sem código de barras")
        if not meta["identificadores"]:
            campos.append(("g:identifier_exists", "no"))
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
        + "".join(f"{item}\n" for item in itens)
        + "  </channel>\n"
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
