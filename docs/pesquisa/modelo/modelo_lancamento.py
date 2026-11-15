#!/usr/bin/env python3
"""Modelo financeiro: desenvolvimento (M1-M6, 1 pessoa) e lançamento (M7+).

Arquitetura COMPLETA (cascata de 7 etapas, política Search-R1, DGM, busca ao
vivo MCP) já no lançamento.
Fontes: docs/Plano_MVP_6_meses.md (plano, preços, mix de planos e aporte),
01 (GPU, Hetzner), 02 (API, tokens por etapa), 04 (tributos), 05 (mercado).
Tudo que não vem dessas fontes nem das premissas aprovadas pelo cliente está
marcado com [PREMISSA A CONFIRMAR]. Só biblioteca padrão.

Saídas: apresentacao/data/modelo.json e pesquisa/08-modelo-mvp.md
Uso: python3 modelo_lancamento.py
"""
import copy
import json
import math
import os

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAIDA_JSON = os.path.join(RAIZ, "apresentacao", "data", "modelo.json")
SAIDA_MD = os.path.join(RAIZ, "pesquisa", "08-modelo-mvp.md")
PC = "[PREMISSA A CONFIRMAR]"

# =============================================================================
# PREMISSAS
# =============================================================================
P = {
    # --- Câmbio (cliente) ------------------------------------------------------
    "ptax": 5.4935,
    "cambio_pf": 5.69,               # cartão PF com IOF 3,5%, antes do CNPJ
    "acrescimo_cnpj": 0.451,         # 04, caso base de importação de serviço (≈ R$ 7,97/US$)
    "eur_usd": 1.16,                 # [PREMISSA A CONFIRMAR] para Hetzner (cobra em €)
    "mes_cnpj": 5,                   # CNPJ aberto no M5 (plano); antes, cartão PF

    # --- API, US$/Mtok (02) ----------------------------------------------------
    "llm": {
        "haiku":  {"entrada": 0.10, "saida": 0.50, "cache_leitura": 0.01, "cache_escrita": 0.125},
        "sonnet": {"entrada": 2.00, "saida": 10.0, "cache_leitura": 0.10, "cache_escrita": 2.50},
        "opus":   {"entrada": 4.00, "saida": 20.0, "cache_leitura": 0.20, "cache_escrita": 5.00},
    },
    "fator_preco_api": 1.0,
    "cache_prefixo_leituras": 0.90,  # 02
    "busca_web_usd": 0.01,           # US$ 10 por mil buscas (02, busca ao vivo)

    # --- Pergunta na arquitetura completa (02 + roteamento por dificuldade) ----
    # Etapas 3-6 (vigência, BM25, ColBERT, PageRank, Rank1) e a política Search-R1
    # rodam em CPU/GPU próprias: custo de API zero, custo fixo de GPU por degrau.
    "entendimento": (800, 8000, 600, 1.10),   # etapa 1: novos, cache, saída, +10% (02)
    "valida_cache": (3000, 2000, 300),        # etapa 2: no acerto, Haiku confere vigência (02)
    "instrucoes_cache": 10000,
    "pergunta_historico": 1500,
    "segunda_rodada": 0.25,                   # política manda buscar de novo (02)
    "ctx_segunda_rodada": 5000,               # +5 mil tokens de contexto no modelo principal [PREMISSA A CONFIRMAR]
    "busca_ao_vivo": 0.05,                    # 5% das perguntas: 2 buscas + 15 mil tokens (02)
    "ctx_busca_ao_vivo": 15000,
    "reescrita": 0.15,                        # 02
    "verificacao": (11200, 4000),             # 02
    "fator_raciocinio": 1.0,
    # Cache semântico: 0% no lançamento, cresce com a base: 0,15 + 0,10·log10(u/1000)
    "cache_semantico": (0.15, 0.10, 0.0, 0.30),
    # Roteamento (08 anterior; Rank1 entrega contexto mais enxuto) [PREMISSA A CONFIRMAR: medir no beta]
    "classes": [
        dict(id="A", nome="Simples (prazo, alíquota, qual artigo)", part=0.60, modelo="haiku",
             ctx=10000, raciocinio=2000, resposta=1000, verif="haiku", saida_verif=1500,
             escala=0.03, escala_modelo="sonnet", escala_rac=2000),
        dict(id="B", nome="Padrão (interpretar uma norma)", part=0.30, modelo="haiku",
             ctx=16000, raciocinio=4000, resposta=1200, verif="haiku", saida_verif=2500,
             escala=0.08, escala_modelo="sonnet", escala_rac=3000),
        dict(id="C", nome="Difícil (várias normas, data passada)", part=0.09, modelo="sonnet",
             ctx=25000, raciocinio=5000, resposta=1500, verif="haiku", saida_verif=3000,
             escala=0.05, escala_modelo="opus", escala_rac=6000),
        dict(id="D", nome="Crítica (alto risco, fontes divergentes)", part=0.01, modelo="opus",
             ctx=40000, raciocinio=6000, resposta=1500, verif="sonnet", saida_verif=2500,
             escala=0.0, escala_modelo="opus", escala_rac=0),
    ],
    # Roteamento conservador (mais Sonnet), só para sensibilidade
    "roteamento_07": {"A": (0.50, "haiku"), "B": (0.35, "sonnet"), "C": (0.12, "sonnet"), "D": (0.03, "opus")},

    # --- Planos e mix (Plano_MVP_6_meses.md) ----------------------------------
    "planos": [
        dict(id="gratis", nome="Grátis", usuarios=1, perguntas=10, preco_mensal=0, preco_anual_mes=0, gateway=0.0),
        dict(id="individual", nome="Individual", usuarios=1, perguntas=100, preco_mensal=199, preco_anual_mes=169, gateway=0.035),
        dict(id="escritorio", nome="Escritório", usuarios=5, perguntas=400, preco_mensal=790, preco_anual_mes=659, gateway=0.012),
        dict(id="corporativo", nome="Corporativo", usuarios=15, perguntas=1050, preco_mensal=2290, preco_anual_mes=1890, gateway=0.012),
        dict(id="enterprise", nome="Enterprise", usuarios=50, perguntas=3500, preco_mensal=6900, preco_anual_mes=6900, gateway=0.01),
    ],
    "pagos": ["individual", "escritorio", "corporativo", "enterprise"],
    "pacote_extra": dict(perguntas=100, preco=149),
    "parcela_anual": 0.40,
    "uso_medio": 0.50,
    "mix": {100: (0.60, 0.40, 0.00, 0.00), 1000: (0.40, 0.40, 0.15, 0.05), 10000: (0.30, 0.35, 0.20, 0.15)},
    "gratis_por_pagante": 1.0,
    "perguntas_gratis_usadas": 6,    # só classe A, sem escalonar

    # --- Tributos sobre a receita (04) ----------------------------------------
    "simples_anexo_iii": [(180e3, .06, 0), (360e3, .112, 9360), (720e3, .135, 17640),
                          (1.8e6, .16, 35640), (3.6e6, .21, 125640), (4.8e6, .33, 648000)],
    "simples_anexo_v": [(180e3, .155, 0), (360e3, .18, 4500), (720e3, .195, 9900),
                        (1.8e6, .205, 17100), (3.6e6, .23, 62100), (4.8e6, .305, 540000)],
    # Lucro Presumido em 2027 (04): ISS 2,9 + CBS 11,3 + IBS 0,1 sobre a receita; IRPJ 15% e
    # CSLL 9% sobre 32% (35,2% acima de R$ 5 mi/ano); adicional de 10% acima de R$ 20 mil/mês
    "presumido": dict(sobre_receita=0.143, irpj=0.15, csll=0.09, presuncao=0.32, presuncao_lc224=0.352,
                      limite_lc224_mes=5e6 / 12, adicional=0.10, faixa_adicional=20000),
    "fator_r_minimo": 0.28,

    # --- GPU -------------------------------------------------------------------
    "runpod": {"rtx4090": 0.89, "rtx5090": 1.19, "a100": 1.19, "h100": 1.99},  # US$/h, runpod.io 4/11/2026
    "runpod_volume_usd_mes": 10,     # disco de rede ~100 GB [PREMISSA A CONFIRMAR]
    "gex45_eur": 214, "gex45_setup_eur": 209,   # Hetzner GEX45 (01)
    "gpu_s_por_pergunta": 3.5,       # Rank1 + política + codificador numa GPU classe L4 (01, a medir)
    "pico_parcela": 0.85, "pico_horas": 220, "folga_pico": 2.0,   # 01
    "rtx5090_vs_l4": 3.0,            # [PREMISSA A CONFIRMAR] throughput de decodificação
    "expediente_h": 264,             # 12 h × 22 dias (01)
    "rtx5090_brl": 27800,            # mediana 3 meses, gpuprix.com, 4/11/2026
    "host_brl": 13000,               # [PREMISSA A CONFIRMAR] CPU, 128 GB RAM, 2 TB NVMe, fonte 1.600 W, gabinete
    "energia_brl": 375,              # R$ 350-400/mês 24h (estimativa do cliente)
    "colocation_brl": 700,           # [PREMISSA A CONFIRMAR] espaço + link num datacenter em SP
    "vida_util_meses": 36,           # [PREMISSA A CONFIRMAR]
    "payback_alvo_meses": 12,

    # --- Operação por degrau [PREMISSA A CONFIRMAR, exceto onde indicado] -----
    # infra sem GPU (banco + índices ColBERT/BM25 + app + backup), R$/mês
    "degraus": [
        dict(degrau=0, ate=50, infra=1200, treino_h100_h=15, dgm_usd=100, seguro=0, auditoria=0, suporte=False),
        dict(degrau=1, ate=500, infra=2500, treino_h100_h=20, dgm_usd=100, seguro=500, auditoria=1600, suporte=False),
        dict(degrau=2, ate=3000, infra=6000, treino_h100_h=40, dgm_usd=300, seguro=800, auditoria=3200, suporte=True),
        dict(degrau=3, ate=10000, infra=15000, treino_h100_h=80, dgm_usd=755, seguro=1500, auditoria=4800, suporte=True),
    ],
    "manutencao_base_usd": 136,      # 02 (lote + cache)
    "suporte_por_assento": 6.0,      # só a partir do degrau 2 (o fundador não atende sozinho)
    "contador_mensal": 400,
    "outros_fixos": 100,
    "pro_labore_ref": 10000,         # [PREMISSA A CONFIRMAR]
}

# Desenvolvimento M1-M6: (id, rótulo, moeda, valores por mês, fator mín, fator máx)
# moeda: "usd" (exterior), "eur" (exterior), "brl"
DEV = [
    ("api_ingestao", "API: ingestão e enriquecimento (extração por programa + Haiku; doc2query, RAPTOR, grafo)", "usd",
     [199, 199, 114, 57, 0, 0], 0.70, 1.70),
    ("api_traces_rank1", "API: traces para destilar o Rank1 (≈ 15 mil exemplos, lote)", "usd", [0, 0, 120, 0, 0, 0], 0.50, 2.00),
    ("api_dev", "API: desenvolvimento, testes e regressão do benchmark", "usd", [40, 40, 70, 70, 70, 70], 0.60, 1.50),
    ("api_dgm", "API: ciclos DGM enxutos (10 variantes, benchmark de 200)", "usd", [0, 0, 0, 100, 100, 100], 0.60, 2.00),
    ("api_playtesters", "API: perguntas dos playtesters", "usd", None, 0.50, 2.00),   # calculado
    ("gpu", "GPU por hora (RunPod)", "usd", None, 0.60, 1.60),                        # calculado
    ("servidor", "Servidor dedicado (Postgres + índices + app; M1–M2 local)", "eur", [0, 0, 70, 70, 70, 70], 0.50, 1.50),
    ("dominio", "Domínio .com.br", "brl", [40, 0, 0, 0, 0, 0], 1.0, 1.0),
    ("cnpj", "CNPJ (aberto pelos contadores do grupo)", "brl", [0, 0, 0, 0, 0, 0], 1.0, 1.0),
    ("e_cnpj", "e-CNPJ A1", "brl", [0, 0, 0, 0, 200, 0], 0.75, 1.40),
    ("termos_lgpd", "Termos de uso e LGPD (modelo + revisão)", "brl", [0, 0, 0, 0, 500, 0], 0.0, 3.0),
    ("sindicatos_juntas", "Sindicatos e Juntas: OCR aberto em GPU por hora + Haiku em lote", "brl",
     [0, 0, 100, 150, 50, 0], 0.50, 800 / 300),   # [PREMISSA A CONFIRMAR] faixa R$ 150–800
]
# Aporte dos 6 meses pedido aos playtesters (Plano_MVP_6_meses.md): assinaturas no cartão PF
APORTE_TOTAL = 20000
APORTE_ASSINATURAS = [   # (id, rótulo, conta, US$/mês ou None, R$ fixo)
    ("claude_ultra", "Claude Ultra (antigo Max 20x)", "US$ 200/mês × 6", 200, None),
    ("cursor_premium", "Cursor Premium, com Grok Bot e agentes", "US$ 30/mês × 6", 30, None),
    ("vps_agentes", "Ambiente isolado (VPS) para agentes abertos (OpenClaw, Hermes)", "6 meses", None, 360),
]
# Horas de GPU no desenvolvimento [PREMISSA A CONFIRMAR: estimativa própria, ref. 01]
GPU_HORAS = {
    "rtx4090": [0, 15, 30, 25, 50, 60],   # indexação/reindexação ColBERT, ajuste do ColBERT, testes Rank1, beta, DGM
    "a100":    [0, 0, 25, 0, 0, 0],       # SFT/LoRA do Rank1-7B
    "h100":    [0, 0, 0, 30, 30, 10],     # GRPO/LoRA da política 3B (2 rodadas + ajuste)
}
PLAYTESTERS_PERGUNTAS = [0, 0, 300, 800, 2000, 3000]   # [PREMISSA A CONFIRMAR]

# =============================================================================
# FORMATAÇÃO pt-BR
# =============================================================================
def num(v, d=0):
    s = f"{v:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def brl(v, d=0):
    return ("−" if v < 0 else "") + "R$ " + num(abs(v), d)


def pct(v, d=1):
    return ("−" if v < 0 else "") + num(abs(v) * 100, d) + "%"


# =============================================================================
# CÂMBIO E API
# =============================================================================
def fx(p, cnpj, moeda="usd"):
    if moeda == "brl":
        return 1.0
    usd = p["ptax"] * (1 + p["acrescimo_cnpj"]) if cnpj else p["cambio_pf"]
    return usd * (p["eur_usd"] if moeda == "eur" else 1.0)


def chamada(p, modelo, novos, cache, saida):
    c = p["llm"][modelo]
    r = p["cache_prefixo_leituras"]
    v = novos * c["entrada"] + cache * (r * c["cache_leitura"] + (1 - r) * c["cache_escrita"]) + saida * c["saida"]
    return v * p["fator_preco_api"] / 1e6


def custo_classe_usd(p, k, sem_extras=False):
    """Custo de uma pergunta da classe k que NÃO acertou o cache semântico (etapas 1, 7, verificação)."""
    fr = p["fator_raciocinio"]
    n, c, s, f = p["entendimento"]
    ctx = k["ctx"] + p["pergunta_historico"]
    vn, vc = p["verificacao"]
    seg = 0 if sem_extras else p["segunda_rodada"]
    viv = 0 if sem_extras else p["busca_ao_vivo"]
    m = k["modelo"]
    partes = {
        "entendimento_arvore": chamada(p, "haiku", n, c, s) * f,
        "modelo_principal": chamada(p, m, ctx, p["instrucoes_cache"], k["resposta"] + k["raciocinio"] * fr),
        "segunda_rodada": seg * chamada(p, m, p["ctx_segunda_rodada"], 0, 0),
        "busca_ao_vivo": viv * (2 * p["busca_web_usd"] * p["fator_preco_api"] + chamada(p, m, p["ctx_busca_ao_vivo"], 0, 300)),
        "reescrita": (0 if sem_extras else p["reescrita"]) * chamada(p, m, 3000, ctx + p["instrucoes_cache"], 2000),
        "verificacao_citacoes": chamada(p, k["verif"], vn, vc, k["saida_verif"]),
        "escalonamento": (0 if sem_extras else k["escala"]) * (
            chamada(p, k["escala_modelo"], ctx, p["instrucoes_cache"], k["resposta"] + k["escala_rac"] * fr)
            + chamada(p, "haiku", vn, vc, 2500)),
    }
    return sum(partes.values()), partes


def taxa_cache(p, usuarios):
    b, incl, lo, hi = p["cache_semantico"]
    if usuarios <= 0:
        return 0.0
    return min(max(b + incl * math.log10(usuarios / 1000), lo), hi)


def custo_pergunta_usd(p, h=0.0):
    n, c, s, f = p["entendimento"]
    acerto = chamada(p, "haiku", n, c, s) * f + chamada(p, "haiku", *p["valida_cache"])
    erro = sum(k["part"] * custo_classe_usd(p, k)[0] for k in p["classes"])
    return h * acerto + (1 - h) * erro


def custo_gratis_usd(p):
    return custo_classe_usd(p, p["classes"][0], sem_extras=True)[0]


# =============================================================================
# RECEITA, TRIBUTOS, GPU
# =============================================================================
def plano(p, pid):
    return next(x for x in p["planos"] if x["id"] == pid)


def preco_medio(p, pl):
    a = p["parcela_anual"]
    return (1 - a) * pl["preco_mensal"] + a * pl["preco_anual_mes"]


def mix(p, n):
    pts = sorted(p["mix"])
    n = min(max(n, pts[0]), pts[-1])
    for a, b in zip(pts, pts[1:]):
        if n <= b:
            t = (math.log10(n) - math.log10(a)) / (math.log10(b) - math.log10(a))
            return [x + t * (y - x) for x, y in zip(p["mix"][a], p["mix"][b])]
    return list(p["mix"][pts[-1]])


def aliquota_simples(tab, rbt12):
    for teto, nom, pd in tab:
        if rbt12 <= teto:
            return max((rbt12 * nom - pd) / rbt12, 0) if rbt12 > 0 else tab[0][1]
    return None


def tributos(p, receita, folha=0.0):
    rbt12 = receita * 12
    if rbt12 > 4.8e6:
        q = p["presumido"]
        base = min(receita, q["limite_lc224_mes"]) * q["presuncao"] + max(receita - q["limite_lc224_mes"], 0) * q["presuncao_lc224"]
        t = receita * q["sobre_receita"] + base * (q["irpj"] + q["csll"]) + q["adicional"] * max(base - q["faixa_adicional"], 0)
        return t, "Lucro Presumido 2027"
    anexo = "III" if receita and folha / receita >= p["fator_r_minimo"] else "V"
    tab = p["simples_anexo_iii"] if anexo == "III" else p["simples_anexo_v"]
    return receita * aliquota_simples(tab, rbt12), f"Simples Anexo {anexo}"


def gex_brl(p):
    return p["gex45_eur"] * fx(p, True, "eur")


def gex_setup_mes(p):
    return p["gex45_setup_eur"] * fx(p, True, "eur") / 12


def gpu_carga(p, perguntas_gpu):
    """GPUs classe L4 ocupadas no pico."""
    pico_h = p["pico_parcela"] * perguntas_gpu / p["pico_horas"]
    return pico_h * p["gpu_s_por_pergunta"] / 3600


def custo_propria_mes(p, n5090):
    return n5090 * (p["colocation_brl"] + p["energia_brl"])


def capex_proprio(p, n5090):
    return n5090 * (p["rtx5090_brl"] + p["host_brl"])


def gpu_degrau(p, d, perguntas_gpu, propria=False):
    """Custo mensal de GPU de serviço (reranker + política) e de treino/DGM."""
    carga = gpu_carga(p, perguntas_gpu)
    treino_alugado = d["treino_h100_h"] * p["runpod"]["h100"] * fx(p, True)
    if d["degrau"] == 0:
        servico = p["expediente_h"] * p["runpod"]["rtx4090"] * fx(p, True)
        return dict(modo="RunPod RTX 4090 por hora, no expediente", n_gex=0, n_5090=0, servico=servico,
                    treino=treino_alugado, total=servico + treino_alugado, carga=carga, capex=0)
    n_gex = max(1, math.ceil(p["folga_pico"] * carga)) + (1 if d["degrau"] >= 2 else 0)
    alugada = n_gex * (gex_brl(p) + gex_setup_mes(p))
    if not propria:
        return dict(modo=f"{n_gex}× Hetzner GEX45 24/7" + (" (1 de reserva)" if d["degrau"] >= 2 else ""),
                    n_gex=n_gex, n_5090=0, servico=alugada, treino=treino_alugado,
                    total=alugada + treino_alugado, carga=carga, capex=0)
    n5090 = max(1, math.ceil(p["folga_pico"] * carga / p["rtx5090_vs_l4"]))
    servico = custo_propria_mes(p, n5090) + gex_brl(p) + gex_setup_mes(p)   # 1 GEX alugado de reserva
    return dict(modo=f"{n5090}× RTX 5090 própria em colocation + 1 GEX45 de reserva", n_gex=1, n_5090=n5090,
                servico=servico, treino=0.0, total=servico, carga=carga, capex=capex_proprio(p, n5090))


def degrau_de(p, n):
    for d in p["degraus"]:
        if n <= d["ate"]:
            return d
    return p["degraus"][-1]


def operacao(p, n, pro_labore=0.0, propria=None):
    d = degrau_de(p, n)
    if propria is None:
        propria = d["degrau"] >= 3
    m = mix(p, n)
    h = taxa_cache(p, n)
    fxu = fx(p, True)
    cpp = custo_pergunta_usd(p, h) * fxu
    receita = gw = perg = contas = 0.0
    for share, pid in zip(m, p["pagos"]):
        pl = plano(p, pid)
        c = n * share / pl["usuarios"]
        contas += c
        r = c * preco_medio(p, pl)
        receita += r
        gw += r * pl["gateway"]
        perg += c * pl["perguntas"] * p["uso_medio"]
    perg_gratis = n * p["gratis_por_pagante"] * p["perguntas_gratis_usadas"]
    api_var = perg * cpp
    api_gratis = perg_gratis * custo_gratis_usd(p) * fxu
    g = gpu_degrau(p, d, (perg + perg_gratis) * (1 - h), propria)
    api_fixa = (p["manutencao_base_usd"] + d["dgm_usd"]) * p["fator_preco_api"] * fxu
    suporte = n * p["suporte_por_assento"] if d["suporte"] else 0.0
    trib, regime = tributos(p, receita, pro_labore)
    fixos = d["infra"] + api_fixa + d["seguro"] + d["auditoria"] + p["contador_mensal"] + p["outros_fixos"]
    custos = trib + gw + api_var + api_gratis + g["total"] + fixos + suporte + pro_labore
    res = receita - custos
    return dict(usuarios=n, degrau=d["degrau"], contas=contas, mix=m, cache_semantico=h, receita=receita,
                perguntas=perg, perguntas_gratis=perg_gratis, custo_pergunta=cpp, tributos=trib, regime=regime,
                aliquota=trib / receita if receita else 0, gateway=gw, api_perguntas=api_var, api_gratis=api_gratis,
                api_fixa=api_fixa, infra=d["infra"], gpu=g["total"], gpu_modo=g["modo"], gpu_capex=g["capex"],
                seguro=d["seguro"], auditoria=d["auditoria"], suporte=suporte,
                contador_outros=p["contador_mensal"] + p["outros_fixos"], pro_labore=pro_labore,
                custos_totais=custos, resultado=res, margem_operacional=res / receita if receita else 0)


def breakeven(p, pro_labore=0.0):
    for n in range(1, 20001):
        if operacao(p, n, pro_labore)["resultado"] >= 0:
            return n
    return None


def margem_plano(p, pid, uso, ref):
    """(preço médio − Simples do degrau − gateway − API − infra e GPU rateadas por usuário) / preço."""
    pl = plano(p, pid)
    preco = preco_medio(p, pl)
    api = pl["perguntas"] * uso * ref["custo_pergunta"]
    rateio = (ref["infra"] + ref["gpu"]) / ref["usuarios"] * pl["usuarios"]
    trib = preco * ref["aliquota"]
    gw = preco * pl["gateway"]
    lucro = preco - trib - gw - api - rateio
    return dict(preco=preco, api=api, rateio=rateio, margem=lucro / preco)


# =============================================================================
# DESENVOLVIMENTO
# =============================================================================
def desenvolvimento(p, alavancas=False):
    q = copy.deepcopy(p)
    cpp_beta = custo_pergunta_usd(q, 0.0)
    gpu_usd = [sum(GPU_HORAS[g][i] * q["runpod"][g] for g in GPU_HORAS) + (q["runpod_volume_usd_mes"] if i >= 1 else 0)
               for i in range(6)]
    linhas = []
    for cid, nome, moeda, vals, fmin, fmax in DEV:
        if cid == "api_playtesters":
            vals = [x * cpp_beta for x in PLAYTESTERS_PERGUNTAS]
        if cid == "gpu":
            vals = gpu_usd
        vals = list(vals)
        if alavancas:   # [PREMISSA A CONFIRMAR] efeito de cada alavanca
            if cid == "api_ingestao":
                vals = [v * 0.70 for v in vals]          # doc2query só nos vigentes; RAPTOR no Haiku
            if cid == "api_traces_rank1":
                vals = [v * 0.40 for v in vals]          # traces de modelo aberto no RunPod/DeepSeek
            if cid == "api_dgm":
                vals = [v * 0.50 for v in vals]          # propostas pelo agente da assinatura; juiz Haiku em lote
            if cid == "gpu":
                vals = [v * 0.75 for v in vals]          # Spot/comunidade; beta por demanda
            if cid == "servidor":
                moeda, vals = "brl", [0, 0, 0, 250, 250, 250]   # VPS no Brasil em R$; M3 na máquina do fundador
            if cid == "termos_lgpd":
                vals = [0] * 6                            # revisão pelo advogado do grupo
        mes_cnpj = 7 if alavancas else q["mes_cnpj"]      # alavanca: CNPJ só no fim do M6
        brl_mes = [v * fx(q, i + 1 >= mes_cnpj, moeda) for i, v in enumerate(vals)]
        linhas.append(dict(id=cid, nome=nome, moeda=moeda, valores_moeda=[round(v, 2) for v in vals],
                           meses=[round(v, 2) for v in brl_mes], base=sum(brl_mes),
                           minimo=sum(brl_mes) * fmin, maximo=sum(brl_mes) * fmax))
    tot = dict(base=sum(l["base"] for l in linhas), minimo=sum(l["minimo"] for l in linhas),
               maximo=sum(l["maximo"] for l in linhas),
               meses=[sum(l["meses"][i] for l in linhas) for i in range(6)])
    horas = {g: sum(v) for g, v in GPU_HORAS.items()}
    return linhas, tot, horas, cpp_beta


# =============================================================================
# EXECUÇÃO
# =============================================================================
def main():
    p = P
    fx_pf, fx_pj = fx(p, False), fx(p, True)
    dev, tot, horas, cpp_beta = desenvolvimento(p)
    dev_alav, tot_alav, _, _ = desenvolvimento(p, alavancas=True)
    teto = 10000
    aporte = []
    for aid, nome, conta, usd, fixo in APORTE_ASSINATURAS:
        aporte.append(dict(id=aid, nome=nome, conta=conta, valor=usd * 6 * fx_pf if usd else fixo))
    aporte.append(dict(id="desenvolvimento", nome="Desenvolvimento: API, GPU por hora, servidor, domínio, e-CNPJ, termos, sindicatos e Juntas",
                       conta="com as alavancas", valor=tot_alav["base"]))
    reserva = APORTE_TOTAL - sum(x["valor"] for x in aporte)
    aporte.append(dict(id="reserva", nome="Reserva", conta=f"cerca de {pct(reserva / APORTE_TOTAL, 0)}", valor=reserva))
    aporte_json = dict(total=APORTE_TOTAL, itens=[dict(x, valor=round(x["valor"], 2), valor_fmt=brl(x["valor"])) for x in aporte],
                       rotulos=dict(total=brl(APORTE_TOTAL)))
    # quanto o CNPJ no M5 custa a mais nos itens do exterior
    usuarios_ref = [50, 500, 3000, 10000]
    ops = [operacao(p, n) for n in usuarios_ref]
    ops_alugada = [operacao(p, n, propria=False) for n in usuarios_ref]
    ref = ops[1]   # degrau 1 (500 usuários) para as margens dos planos

    cpp0 = custo_pergunta_usd(p, 0.0)
    classes = []
    for k in p["classes"]:
        t, partes = custo_classe_usd(p, k)
        classes.append(dict(id=k["id"], nome=k["nome"], participacao=k["part"], modelo=k["modelo"],
                            tokens_contexto=k["ctx"], tokens_raciocinio=k["raciocinio"], escalonamento=k["escala"],
                            escala_para=k["escala_modelo"], custo_usd=round(t, 5), custo_cnpj=round(t * fx_pj, 4),
                            partes_usd={a: round(b, 5) for a, b in partes.items()},
                            rotulos=dict(custo=brl(t * fx_pj, 2), participacao=pct(k["part"], 0))))
    partes_tot = {}
    for k in p["classes"]:
        for a, b in custo_classe_usd(p, k)[1].items():
            partes_tot[a] = partes_tot.get(a, 0) + k["part"] * b

    planos = []
    for pl in p["planos"]:
        item = dict(id=pl["id"], nome=pl["nome"], usuarios=pl["usuarios"], perguntas_mes=pl["perguntas"],
                    preco_mensal=pl["preco_mensal"], preco_anual_mes=pl["preco_anual_mes"],
                    preco_por_usuario=round(pl["preco_mensal"] / pl["usuarios"], 2))
        if pl["id"] in p["pagos"]:
            m50, m100 = margem_plano(p, pl["id"], 0.5, ref), margem_plano(p, pl["id"], 1.0, ref)
            item.update(preco_medio=round(m50["preco"], 2), custo_api_50=round(m50["api"], 2),
                        custo_api_100=round(m100["api"], 2), rateio_infra_gpu=round(m50["rateio"], 2),
                        margem_50=round(m50["margem"], 4), margem_100=round(m100["margem"], 4),
                        rotulos=dict(margem_50=pct(m50["margem"]), margem_100=pct(m100["margem"])))
        else:
            c = pl["perguntas"] * custo_gratis_usd(p) * fx_pj
            item.update(custo_usuario_cota_cheia=round(c, 2), rotulos=dict(custo=brl(c, 2) + " por usuário/mês com a cota cheia"))
        planos.append(item)
    ex = p["pacote_extra"]
    custo_ex = ex["perguntas"] * ref["custo_pergunta"]
    margem_ex = (ex["preco"] * (1 - ref["aliquota"] - 0.035) - custo_ex) / ex["preco"]

    be0 = breakeven(p)
    be_pl = breakeven(p, p["pro_labore_ref"])
    op_be0 = operacao(p, be0)
    op_pl = operacao(p, be_pl, p["pro_labore_ref"])

    # GPU própria: payback por degrau e número de usuários em que o payback cai abaixo do alvo
    gpu_comp = []
    for n in usuarios_ref[1:]:
        d = degrau_de(p, n)
        o = operacao(p, n, propria=False)
        q = (o["perguntas"] + o["perguntas_gratis"]) * (1 - o["cache_semantico"])
        a = gpu_degrau(p, d, q, False)
        b = gpu_degrau(p, d, q, True)
        eco = a["total"] - b["total"]
        gpu_comp.append(dict(usuarios=n, alugada=a["total"], alugada_modo=a["modo"], propria=b["total"],
                             propria_modo=b["modo"], capex=b["capex"], economia_mes=eco,
                             payback_meses=b["capex"] / eco if eco > 0 else None))
    usuarios_compra = None
    for n in range(100, 20001, 50):
        d = degrau_de(p, n)
        o = operacao(p, n, propria=False)
        q = (o["perguntas"] + o["perguntas_gratis"]) * (1 - o["cache_semantico"])
        a, b = gpu_degrau(p, d, q, False), gpu_degrau(p, d, q, True)
        eco = a["total"] - b["total"]
        if eco > 0 and b["capex"] / eco <= p["payback_alvo_meses"]:
            usuarios_compra = n
            break
    tco_5090 = capex_proprio(p, 1) / p["vida_util_meses"] + custo_propria_mes(p, 1)
    runpod_5090_247 = 730 * p["runpod"]["rtx5090"] * fx_pj

    # Sensibilidade
    def cenario(mod):
        q = copy.deepcopy(p); mod(q)
        r500 = operacao(q, 500)
        return dict(custo_pergunta=r500["custo_pergunta"], custo_pergunta_lancamento=custo_pergunta_usd(q, 0) * fx(q, True),
                    margem_individual_50=margem_plano(q, "individual", q["uso_medio"], r500)["margem"],
                    resultado_500=r500["resultado"], resultado_3000=operacao(q, 3000)["resultado"],
                    breakeven=breakeven(q), breakeven_pro_labore=breakeven(q, q["pro_labore_ref"]))

    def rot07(q):
        for k in q["classes"]:
            k["part"], k["modelo"] = q["roteamento_07"][k["id"]]
    sens_def = [
        ("base", "Base", lambda q: None),
        ("cambio_mais_10", "Câmbio +10%", lambda q: q.update(ptax=q["ptax"] * 1.1, cambio_pf=q["cambio_pf"] * 1.1)),
        ("cambio_menos_10", "Câmbio −10%", lambda q: q.update(ptax=q["ptax"] * 0.9, cambio_pf=q["cambio_pf"] * 0.9)),
        ("uso_x2", "Uso ×2 (100% da cota)", lambda q: q.update(uso_medio=1.0)),
        ("api_mais_30", "API +30%", lambda q: q.update(fator_preco_api=1.3)),
        ("api_menos_30", "API −30%", lambda q: q.update(fator_preco_api=0.7)),
        ("roteamento_07", "Roteamento conservador (B no Sonnet)", rot07),
    ]
    sens = []
    for cid, nome, mod in sens_def:
        r = cenario(mod)
        r.update(id=cid, nome=nome, rotulos=dict(custo_pergunta=brl(r["custo_pergunta_lancamento"], 3),
                                                 margem_individual=pct(r["margem_individual_50"]),
                                                 resultado_500=brl(r["resultado_500"]), resultado_3000=brl(r["resultado_3000"]),
                                                 breakeven=f'{num(r["breakeven"])} usuários',
                                                 breakeven_pro_labore=f'{num(r["breakeven_pro_labore"])} usuários'))
        sens.append(r)

    premissas_confirmar = [
        "Horas de GPU do desenvolvimento (≈ 275 GPU-h) e perguntas dos playtesters (6.100 no total)",
        "Ingestão por programa com Haiku só onde o programa falha (US$ 568 com doc2query, RAPTOR e grafo)",
        "Ciclo DGM enxuto a US$ 100 (10 variantes, benchmark de 200, juiz Haiku)",
        "Servidor dedicado de dev a €70/mês e câmbio €/US$ 1,16",
        "Roteamento 60/30/9/1%, tokens por classe e +5 mil tokens na segunda rodada",
        "3,5 s de GPU classe L4 por pergunta (01) e RTX 5090 = 3× L4",
        "Infra sem GPU por degrau (R$ 1,2 mil / 2,5 mil / 6 mil / 15 mil)",
        "Seguro E&O, auditoria humana amostral e suporte a R$ 6/assento a partir do degrau 2",
        "Host da GPU (R$ 13 mil), colocation (R$ 700/mês) e vida útil de 36 meses",
        "Pró-labore de referência de R$ 10 mil/mês",
        "Efeito de cada alavanca do orçamento",
        "OCR e classificação de sindicatos e Juntas (R$ 300; faixa R$ 150–800)",
    ]

    # ------------------------------------------------------------------ JSON
    def op_json(o):
        d = {k: (round(v, 2) if isinstance(v, float) else v) for k, v in o.items() if k != "mix"}
        d["mix"] = {pid: round(s, 3) for pid, s in zip(p["pagos"], o["mix"])}
        d["custo_infra"] = round(o["infra"] + o["gpu"], 2)
        d["rotulos"] = dict(receita=brl(o["receita"]), tributos=f'{brl(o["tributos"])} ({pct(o["aliquota"])}, {o["regime"]})',
                            api=brl(o["api_perguntas"] + o["api_gratis"] + o["api_fixa"]), infra=brl(o["infra"]),
                            gpu=f'{brl(o["gpu"])} ({o["gpu_modo"]})', resultado=brl(o["resultado"]),
                            custo_por_pergunta=brl(o["custo_pergunta"], 3), margem_operacional=pct(o["margem_operacional"]))
        return d

    J = {
        "meta": dict(titulo="Plano de desenvolvimento (6 meses) e lançamento", data="05/11/2026",
                     gerador="pesquisa/modelo/modelo_lancamento.py", relatorio="pesquisa/08-modelo-mvp.md",
                     fontes=["docs/Plano_MVP_6_meses.md", "pesquisa/05-mercado-preco.md",
                             "pesquisa/01-infra-aws.md", "pesquisa/02-custos-llm.md", "pesquisa/04-juridico-tributario-dados.md"],
                     observacao="1 pessoa; arquitetura completa construída em M1–M6 e lançada no M7; sem receita em M1–M6."),
        "premissas_chave": [
            dict(chave="cambio", valor=p["ptax"], valor_fmt=brl(p["ptax"], 4)),
            dict(chave="reais_por_dolar_api", valor=round(fx_pj, 4), valor_fmt=brl(fx_pj, 2)),
            dict(chave="reais_por_dolar_pf", valor=fx_pf, valor_fmt=brl(fx_pf, 2)),
        ],
        "cambio": dict(ptax=p["ptax"], antes_cnpj=fx_pf, depois_cnpj=round(fx_pj, 4), eur_usd=p["eur_usd"],
                       rotulos=dict(antes_cnpj=brl(fx_pf, 2) + "/US$ (cartão PF, IOF 3,5%)",
                                    depois_cnpj=brl(fx_pj, 2) + "/US$ (PTAX +45,1%, caso base do 04)")),
        "investimento_desenvolvimento": dict(
            teto=teto, total_base=round(tot["base"], 2), total_minimo=round(tot["minimo"], 2), total_maximo=round(tot["maximo"], 2),
            estouro_base=round(tot["base"] - teto, 2), meses=[dict(mes=f"M{i + 1}", base=round(v, 2)) for i, v in enumerate(tot["meses"])],
            itens=[dict(l, base=round(l["base"], 2), minimo=round(l["minimo"], 2), maximo=round(l["maximo"], 2)) for l in dev],
            com_alavancas=dict(total=round(tot_alav["base"], 2), minimo=round(tot_alav["minimo"], 2), maximo=round(tot_alav["maximo"], 2),
                               itens={l["id"]: round(l["base"], 2) for l in dev_alav}),
            gpu_horas=horas, perguntas_playtesters=sum(PLAYTESTERS_PERGUNTAS), custo_pergunta_beta_usd=round(cpp_beta, 5),
            rotulos=dict(total=f'{brl(tot["base"])} ({brl(tot["minimo"])} a {brl(tot["maximo"])})',
                         com_alavancas=brl(tot_alav["base"]))),
        "aporte": aporte_json,
        "custo_por_pergunta": dict(
            usd_lancamento=round(cpp0, 5), medio_lancamento=round(cpp0 * fx_pj, 4), classes=classes,
            partes_usd={a: round(b, 5) for a, b in partes_tot.items()}, gratis=round(custo_gratis_usd(p) * fx_pj, 4),
            por_degrau=[dict(usuarios=o["usuarios"], cache_semantico=round(o["cache_semantico"], 3), custo=round(o["custo_pergunta"], 4)) for o in ops],
            rotulos=dict(medio_lancamento=brl(cpp0 * fx_pj, 3), usd=f"US$ {num(cpp0, 4)}")),
        "planos": dict(lista=planos, parcela_anual=p["parcela_anual"], uso_medio=p["uso_medio"],
                       definicao_margem="(preço médio com 40% no anual − Simples do degrau de 500 usuários − gateway − API − infra e GPU rateadas) / preço",
                       pacote_extra=dict(perguntas=ex["perguntas"], preco=ex["preco"], margem=round(margem_ex, 4),
                                         rotulo=f'{brl(ex["preco"])} por {ex["perguntas"]} perguntas ({pct(margem_ex)} de margem)')),
        "escala": [op_json(o) for o in ops],
        "escala_gpu_alugada": [dict(usuarios=o["usuarios"], gpu=round(o["gpu"], 2), resultado=round(o["resultado"], 2)) for o in ops_alugada],
        "breakeven": dict(sem_salario=be0, com_pro_labore=be_pl, pro_labore=p["pro_labore_ref"],
                          receita_sem_salario=round(op_be0["receita"], 2), receita_com_pro_labore=round(op_pl["receita"], 2),
                          regime_com_pro_labore=op_pl["regime"],
                          rotulos=dict(sem_salario=f'{num(be0)} usuários pagantes ({brl(op_be0["receita"])}/mês)',
                                       com_pro_labore=f'{num(be_pl)} usuários pagantes ({brl(op_pl["receita"])}/mês)')),
        "gpu_propria": dict(preco_rtx5090=p["rtx5090_brl"], host=p["host_brl"], energia=p["energia_brl"], colocation=p["colocation_brl"],
                            custo_total_mes_com_depreciacao=round(tco_5090, 2), runpod_5090_24x7=round(runpod_5090_247, 2),
                            gex45_mes=round(gex_brl(p), 2), comparacao=[{k: (round(v, 2) if isinstance(v, float) else v) for k, v in c.items()} for c in gpu_comp],
                            usuarios_para_comprar=usuarios_compra, payback_alvo_meses=p["payback_alvo_meses"]),
        "sensibilidade": dict(cenarios=sens),
        "premissas_a_confirmar": premissas_confirmar,
    }
    with open(SAIDA_JSON, "w", encoding="utf-8") as fh:
        json.dump(J, fh, ensure_ascii=False, indent=2)

    # ------------------------------------------------------------- RELATÓRIO
    L = []
    a = L.append
    a("# 08 · Modelo financeiro: desenvolvimento (M1–M6) e lançamento (M7+)")
    a("")
    a("Gerado por `pesquisa/modelo/modelo_lancamento.py` em 5/11/2026. 1 pessoa, arquitetura completa no lançamento, "
      "sem receita em M1–M6. Preços, mix de planos e aporte do `docs/Plano_MVP_6_meses.md`; GPU do 01; API e tokens do 02; tributos do 04; mercado do 05. "
      f"**{PC}** marca o que não vem dessas fontes nem das premissas aprovadas.")
    a("")
    a("## 1. Investimento do desenvolvimento (R$)")
    a("")
    a(f"Câmbio: {brl(fx_pf, 2)}/US$ (cartão PF) em M1–M4; {brl(fx_pj, 2)}/US$ a partir do CNPJ (M5). €/US$ {num(p['eur_usd'], 2)} **{PC}**.")
    a("")
    a("| Item | M1 | M2 | M3 | M4 | M5 | M6 | Base | Faixa |")
    a("| --- |" + " ---: |" * 8)
    for l in dev:
        if l["maximo"] == 0:
            continue
        a(f"| {l['nome']} | " + " | ".join(num(v) if v else "–" for v in l["meses"]) + f" | {num(l['base'])} | {num(l['minimo'])}–{num(l['maximo'])} |")
    a("| **Total** | " + " | ".join(f"**{num(v)}**" for v in tot["meses"]) + f" | **{num(tot['base'])}** | **{num(tot['minimo'])}–{num(tot['maximo'])}** |")
    a("")
    gh = sum(horas.values())
    a(f"- GPU: {num(gh)} GPU-h ({num(horas['rtx4090'])} h de RTX 4090, {num(horas['a100'])} h de A100, {num(horas['h100'])} h de H100) + disco de rede **{PC}**. "
      f"Playtesters: {num(sum(PLAYTESTERS_PERGUNTAS))} perguntas a US$ {num(cpp_beta, 4)} (arquitetura completa, sem cache semântico) **{PC}**.")
    a(f"- **Estouro do teto de R$ 10 mil: {brl(tot['base'] - teto)} na base.** Pesam a ingestão/enriquecimento, a GPU, o servidor e o câmbio com CNPJ em M5–M6.")
    a(f"- **Com as alavancas** (CNPJ no fim do M6; VPS no Brasil em R$; doc2query só nos vigentes e RAPTOR no Haiku; traces do Rank1 com modelo aberto; "
      f"propostas da DGM pelo agente da assinatura; GPU Spot/comunidade; termos revisados pelo advogado do grupo): **{brl(tot_alav['base'])}** "
      f"(faixa {brl(tot_alav['minimo'])} a {brl(tot_alav['maximo'])}) **{PC}**.")
    a("")
    a("### Aporte dos 6 meses")
    a("")
    a("O orçamento acima é só o desenvolvimento. O aporte pedido aos playtesters soma a ele as assinaturas dos agentes de programação, o ambiente isolado e uma reserva.")
    a("")
    a("| Destino | Conta | Valor (R$) |")
    a("| --- | --- | ---: |")
    for x in aporte:
        a(f"| {x['nome']} | {x['conta']} | {num(x['valor'])} |")
    a(f"| **Total** | | **{num(APORTE_TOTAL)}** |")
    a("")
    a(f"Assinaturas no cartão PF, com IOF ({brl(fx_pf, 2)}/US$); CNPJ aberto no fim do M6.")
    a("")
    a("## 2. Custo por pergunta da arquitetura completa (produção, com CNPJ)")
    a("")
    a("Etapa 1 (árvore de temas) no Haiku: 8 mil tokens em cache + 800 novos, 600 de saída, +10%. Etapa 2 (cache semântico): no acerto, o Haiku confere a vigência "
      "(3 mil novos + 2 mil em cache, 300 de saída); 0% no lançamento, 12% com 500, 20% com 3.000 e 25% com 10.000 usuários. Etapas 3 a 6 "
      "(vigência, BM25, ColBERT com doc2query, PageRank, Rank1) e a política Search-R1: CPU/GPU próprias, sem API (custo de GPU na seção 3). "
      f"Etapa 7: 10 mil tokens de instruções em cache + contexto da classe + 1,5 mil de pergunta; segunda rodada em 25% (+5 mil tokens **{PC}**); "
      "busca ao vivo MCP em 5% (2 buscas a US$ 0,01 + 15 mil tokens); reescrita em 15%; verificação de citações (11,2 mil novos + 4 mil em cache); escalonamento.")
    a("")
    a("| Classe | Peso | Modelo | Contexto / raciocínio | Escala | US$ | R$ |")
    a("| --- | ---: | --- | --- | --- | ---: | ---: |")
    for c in classes:
        a(f"| {c['id']}. {c['nome']} | {pct(c['participacao'], 0)} | {c['modelo'].capitalize()} 5.5 | {num(c['tokens_contexto'])} / {num(c['tokens_raciocinio'])} | "
          f"{pct(c['escalonamento'], 0)} → {c['escala_para'].capitalize()} | {num(c['custo_usd'], 4)} | {num(c['custo_cnpj'], 3)} |")
    a(f"| **Média no lançamento (cache 0%)** | | | | | **{num(cpp0, 4)}** | **{num(cpp0 * fx_pj, 3)}** |")
    a("")
    a(f"Roteamento por dificuldade **{PC}** (medir com os playtesters). Por degrau, com o cache semântico: "
      + "; ".join(f"{num(o['usuarios'])} usuários {brl(o['custo_pergunta'], 3)}" for o in ops)
      + f". Plano Grátis (só classe A, sem extras): {brl(custo_gratis_usd(p) * fx_pj, 3)} por pergunta. "
      f"O modelo principal pesa {pct(partes_tot['modelo_principal'] / cpp0, 0)} do custo; a classe C, {pct(classes[2]['custo_usd'] * .09 / cpp0, 0)}.")
    a("")
    a("## 3. Operação por degrau (R$/mês, sem pró-labore)")
    a("")
    a("Mix de assentos do plano (interpolado; 60/40/0/0 Individual/Escritório/Corporativo/Enterprise com até 100 usuários, 30/35/20/15 com 10.000), "
      "40% no anual, uso de 50% da cota, 1 usuário grátis por pagante usando 6 perguntas. Pacotes extras fora da receita (conservador).")
    a("")
    a("| Usuários pagantes | " + " | ".join(num(o["usuarios"]) for o in ops) + " |")
    a("| --- |" + " ---: |" * len(ops))
    rows = [("Degrau", lambda o: str(o["degrau"])), ("Perguntas pagas/mês", lambda o: num(o["perguntas"])),
            ("**Receita**", lambda o: f"**{num(o['receita'])}**"),
            ("Tributos (regime)", lambda o: f"{num(o['tributos'])} ({pct(o['aliquota'])}, {o['regime'].replace('Simples ', '')})"),
            ("Gateway", lambda o: num(o["gateway"])), ("API das perguntas (+ Grátis)", lambda o: f"{num(o['api_perguntas'])} (+{num(o['api_gratis'])})"),
            ("API fixa (base + DGM)", lambda o: num(o["api_fixa"])), (f"Infra sem GPU {PC}", lambda o: num(o["infra"])),
            ("GPU (serviço + treino)", lambda o: num(o["gpu"])),
            (f"Seguro, auditoria, suporte, contador {PC}", lambda o: num(o["seguro"] + o["auditoria"] + o["suporte"] + o["contador_outros"])),
            ("**Resultado**", lambda o: f"**{num(o['resultado'])}**"), ("Margem operacional", lambda o: pct(o["margem_operacional"]))]
    for nome, fn in rows:
        a(f"| {nome} | " + " | ".join(fn(o) for o in ops) + " |")
    a("")
    a("GPU: " + "; ".join(f"{num(o['usuarios'])}: {o['gpu_modo']}" for o in ops)
      + f". Com 10.000 usuários e GPU só alugada, o resultado seria {brl(ops_alugada[3]['resultado'])} (GPU {brl(ops_alugada[3]['gpu'])}). "
      "Acima de R$ 4,8 mi/ano sai do Simples; o Presumido de 2027 já inclui CBS/IBS (04).")
    a("")
    a("**Fator R:** sem folha, software cai no Anexo V (15,5% na 1ª faixa); pró-labore ≥ 28% da receita leva ao Anexo III (6%). "
      "Compensa quando o pró-labore é retirada que o fundador já faria (o sócio paga 11% de INSS + IRPF).")
    a("")
    a("## 4. Margem por plano (degrau de 500 usuários)")
    a("")
    a(f"Margem = (preço médio com 40% no anual − Simples efetivo de {pct(ref['aliquota'])} − gateway − API a {brl(ref['custo_pergunta'], 3)}/pergunta "
      f"− infra e GPU rateadas por usuário) / preço.")
    a("")
    a("| Plano | Usuários | Perguntas | Mensal / anual | Preço médio | Margem a 50% | Margem a 100% |")
    a("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for x in planos:
        if x["id"] == "gratis":
            continue
        a(f"| {x['nome']} | {x['usuarios']} | {num(x['perguntas_mes'])} | {brl(x['preco_mensal'])} / {brl(x['preco_anual_mes'])} | {brl(x['preco_medio'])} | "
          f"{x['rotulos']['margem_50']} | {x['rotulos']['margem_100']} |")
    a("")
    a(f"Pacote extra: {brl(ex['preco'])} por 100 perguntas, margem de {pct(margem_ex)}. Grátis: {next(x for x in planos if x['id'] == 'gratis')['rotulos']['custo']} (custo de aquisição).")
    a("")
    a("## 5. Breakeven operacional")
    a("")
    a(f"- **Sem salário:** {num(be0)} usuários pagantes ({brl(op_be0['receita'])}/mês). O piso é a infra mínima com a arquitetura completa (servidor + GPU por hora + DGM).")
    a(f"- **Com pró-labore de {brl(p['pro_labore_ref'])} {PC}:** {num(be_pl)} usuários pagantes ({brl(op_pl['receita'])}/mês; {op_pl['regime']}).")
    a("")
    a("## 6. GPU própria × alugada")
    a("")
    a(f"RTX 5090 (R$ 27,8 mil, gpuprix, 4/11/2026) + host {brl(p['host_brl'])} **{PC}** = {brl(capex_proprio(p, 1))}. Operação: colocation {brl(p['colocation_brl'])} **{PC}** + energia {brl(p['energia_brl'])}. "
      f"Custo mensal com depreciação em 36 meses: {brl(tco_5090)}. Aluguel: GEX45 {brl(gex_brl(p))}/mês (GPU de 20–24 GB, ≈ 1/3 da 5090 **{PC}**); RunPod 5090 24/7 {brl(runpod_5090_247)}/mês.")
    a("")
    a("| Usuários | Só alugada | R$/mês | Com própria | R$/mês | Investimento | Payback |")
    a("| ---: | --- | ---: | --- | ---: | ---: | ---: |")
    for c in gpu_comp:
        pb = f"{num(c['payback_meses'], 1)} meses" if c["payback_meses"] else "não se paga"
        a(f"| {num(c['usuarios'])} | {c['alugada_modo']} + treino por hora | {num(c['alugada'])} | {c['propria_modo']} | {num(c['propria'])} | {num(c['capex'])} | {pb} |")
    a("")
    a(f"Payback ≤ 12 meses a partir de **≈ {num(usuarios_compra)} usuários pagantes** (quando a compra substitui 3 ou mais servidores alugados e as horas de treino).")
    a("")
    a("## 7. Sensibilidade")
    a("")
    a("| Cenário | R$/pergunta (lançamento) | Margem Individual a 50% | Resultado 500 | Resultado 3.000 | Breakeven | Com pró-labore |")
    a("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for s in sens:
        r = s["rotulos"]
        a(f"| {s['nome']} | {r['custo_pergunta']} | {r['margem_individual']} | {r['resultado_500']} | {r['resultado_3000']} | {num(s['breakeven'])} | {num(s['breakeven_pro_labore'])} |")
    a("")
    a("## Premissas a confirmar")
    a("")
    for x in premissas_confirmar:
        a(f"- {x}.")
    a("")
    with open(SAIDA_MD, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))

    # ------------------------------------------------------------- CONSOLE
    print(f"DEV base {tot['base']:.0f} ({tot['minimo']:.0f}-{tot['maximo']:.0f}) | alavancas {tot_alav['base']:.0f} ({tot_alav['minimo']:.0f}-{tot_alav['maximo']:.0f})")
    for l in dev:
        print(f"  {l['id']:18s} {l['base']:8.0f}  " + " ".join(f"{v:6.0f}" for v in l["meses"]))
    print("  meses", [round(v) for v in tot["meses"]], "gpu h", horas, f"cpp_beta {cpp_beta:.4f}")
    print(f"cpp lançamento US$ {cpp0:.4f} R$ {cpp0 * fx_pj:.3f} | grátis R$ {custo_gratis_usd(p) * fx_pj:.3f} | partes", {k: round(v / cpp0, 2) for k, v in partes_tot.items()})
    for x in planos:
        if "margem_50" in x:
            print(f"  {x['nome']:12s} {x['margem_50']:.1%} {x['margem_100']:.1%}")
    print(f"  extra {margem_ex:.1%}")
    for o in ops:
        print(f"{o['usuarios']:6d} rec {o['receita']:10.0f} trib {o['tributos']:9.0f} {o['regime']:24s} api {o['api_perguntas'] + o['api_gratis'] + o['api_fixa']:8.0f} "
              f"infra {o['infra']:6.0f} gpu {o['gpu']:7.0f} res {o['resultado']:10.0f} ({o['margem_operacional']:.1%}) cpp {o['custo_pergunta']:.3f} | {o['gpu_modo']}")
    print(f"breakeven {be0} ({op_be0['receita']:.0f}) | pró-labore {be_pl} ({op_pl['regime']}, {op_pl['receita']:.0f})")
    for c in gpu_comp:
        print("  gpu", c["usuarios"], round(c["alugada"]), round(c["propria"]), round(c["capex"]), c["payback_meses"] and round(c["payback_meses"], 1))
    print(f"  comprar a partir de {usuarios_compra} | tco5090 {tco_5090:.0f} | runpod5090 {runpod_5090_247:.0f} | gex {gex_brl(p):.0f}")
    for s in sens:
        print(" ", s["nome"], s["rotulos"])
    print("linhas md:", len(L))


if __name__ == "__main__":
    main()
