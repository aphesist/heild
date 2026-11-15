#!/usr/bin/env python3
"""Gera a cola de celular (cola/index.html) a partir de ROTEIRO-DE-FALAS.md.

Uso: python3 apresentacao/cola/gerar_cola.py
"""
import json
import re
from pathlib import Path

import markdown

AQUI = Path(__file__).resolve().parent
ROTEIRO = AQUI.parent / "ROTEIRO-DE-FALAS.md"
MODELO = AQUI / "modelo.html"
SAIDA = AQUI / "index.html"

md = ROTEIRO.read_text(encoding="utf-8")


def html(texto):
    return markdown.markdown(texto, extensions=["tables", "fenced_code", "sane_lists"])


def marcar(h):
    h = re.sub(r"\[CLIQUE (\d+)\]", r'<span class="mk mk-clique">CLIQUE \1</span>', h)
    h = h.replace("[PAUSA]", '<span class="mk mk-pausa">PAUSA</span>')
    h = h.replace("[AVANÇA]", '<span class="mk mk-avanca">AVANÇA ›</span>')
    # parágrafo que é só marcação vira linha de marcação
    h = re.sub(r'<p>(\s*<span class="mk[^"]*">[^<]*</span>\s*)</p>', r'<p class="so-mk">\1</p>', h)
    # parágrafos e itens com negrito entram na versão curta
    h = re.sub(r"<(p|li)>(?=[^\n]*<strong>)", r'<\1 class="chave">', h)
    return h


# ---- partes fixas
inicio_txt = md.split("## Como usar", 1)[1].split("\n## Seção", 1)[0]
inicio_txt = re.sub(r"```bash.*?```", "", inicio_txt, flags=re.S)  # comando de recontagem não serve no celular
inicio_txt = re.sub(r"Contagem de cliques conferida.*?\n\n", "", inicio_txt, flags=re.S)
perguntas_txt = md.split("## Perguntas prováveis", 1)[1].split("\n## Glossário", 1)[0]
glossario_txt = md.split("## Glossário", 1)[1].split("\n", 1)[1]

# ---- slides
slides = []
secao = ""
blocos = re.split(r"\n(?=## Seção |### Slide )", md.split("\n## Perguntas prováveis", 1)[0])
for b in blocos:
    if b.startswith("## Seção"):
        secao = b.split("\n", 1)[0].replace("## ", "").strip()
        continue
    if not b.startswith("### Slide"):
        continue
    cab, corpo = b.split("\n", 1)
    m = re.match(r"### Slide (\d+) · (.*)", cab)
    num, titulo = int(m.group(1)), m.group(2).strip()
    meta = re.search(r"⏱\s*([^\n]*)", corpo)
    meta = meta.group(1).strip() if meta else ""
    tempo = re.search(r"^([\d:]+)", meta)
    curta = re.search(r"curta ([\d:]+)", meta)
    cliques = re.search(r"cliques: (\d+)", meta)
    entender = ""
    me = re.search(r"\n> \*\*Para você entender\*\* · (.*)", corpo, flags=re.S)
    if me:
        entender = re.sub(r"\n>\s?", "\n", me.group(1)).strip()
        corpo = corpo[: me.start()]
    fala = corpo.split("**FALA**", 1)[1] if "**FALA**" in corpo else corpo
    fala = fala.replace("---", "").strip()
    slides.append(
        {
            "n": num,
            "titulo": titulo,
            "secao": re.sub(r"^Seção \d+ · ", "", secao),
            "tempo": tempo.group(1) if tempo else "",
            "curta": curta.group(1) if curta else "",
            "cliques": int(cliques.group(1)) if cliques else 0,
            "fala": marcar(html(fala)),
            "entender": html(entender) if entender else "",
        }
    )

dados = {
    "inicio": html(inicio_txt),
    "perguntas": html(perguntas_txt),
    "glossario": html(glossario_txt),
    "slides": slides,
}
js = json.dumps(dados, ensure_ascii=False).replace("</", "<\\/")
SAIDA.write_text(MODELO.read_text(encoding="utf-8").replace("/*DADOS*/null", js), encoding="utf-8")
print(f"{SAIDA}: {len(slides)} slides, {SAIDA.stat().st_size // 1024} KB")
