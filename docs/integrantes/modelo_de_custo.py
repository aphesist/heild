# Modelo de custo dos integrantes por desenho e por tipo de tarefa (ESTIMATIVA; ver AVALIACAO.md, 4.1).
# Preços US$/MTok (entrada nova, leitura de cache, saída): tabela Anthropic 2026-11 e estudo de precificação 3.1.
P = {'O': (4.0, 0.20, 20.0), 'S': (2.0, 0.10, 10.0), 'H': (0.10, 0.01, 0.50)}
CAMBIO = 7.97
def c(m, cache_k, novo_k, saida_k):
    e, r, o = P[m]
    return (cache_k*r + novo_k*e + saida_k*o) / 1000.0  # US$ (k tokens -> /1000 por MTok)
def calls(lst): return sum(c(*x) for x in lst)
def mix(base, alt, p): return (1-p)*base + p*alt

# Arquétipos: T1 consulta simples no chat; T2 ação curta no chat (com cartão); T3 evento repetitivo
# (documento/linha de extrato); T4 evento com trabalho (pedido implícito -> tarefa + cartão);
# T5 job sobre a carteira (60 clientes); T6 trabalho longo (parecer, multi-setor).
ROUTER_H = ('H', 3, 0.5, 0.15)
VERIF_H  = ('H', 0, 3, 0.4)
D = {}
# B0: plano atual (02/07): roteador regras+barato, integrante = casca em Sonnet, filhos Haiku, verificação.
D['B0 plano atual (Sonnet + filhos Haiku)'] = {
 'T1': 0.5*c(*ROUTER_H) + c('S',10,3,0.5),
 'T2': 0.5*c(*ROUTER_H) + calls([('S',10,5,0.8),('S',12,3,0.4),('S',14,3,0.4),('S',16,3,0.6)]) + c(*VERIF_H),
 'T3': c('S',10,2.5,0.3),
 'T4': calls([('S',12,5,0.8),('S',14,4,0.4),('S',16,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('S',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('S',15,10,1.5),
 'T6': calls([('S',12,8,1.5)] + [('S',20,6,0.8)]*6 + [('S',25,10,3)]) + 5*c('H',5,8,1) + 2*c(*VERIF_H),
}
# A: ideia do dono, literal: Geral Opus -> integrante do setor Opus (orquestra) -> operários Sonnet.
G_route = ('O',8,1.5,0.3); G_final = ('O',8,2,0.5)
D['A ideia do dono: Geral Opus > setor Opus > Sonnet'] = {
 'T1': c('O',10,3,0.5),  # o Geral responde a consulta simples sozinho (02, 9.1)
 'T2': calls([G_route, ('O',12,4,1.0)] + [('S',8,3,0.4)]*3 + [('O',12,4,0.4), G_final]) + c(*VERIF_H),
 'T3': calls([('O',10,2.5,0.3), ('S',8,2.5,0.3), ('O',10,1.5,0.2)]),
 'T4': calls([('O',12,5,0.8)] + [('S',8,4,0.4)]*3 + [('O',12,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('O',20,5,1.5)]) + 6*c('S',5,6,0.8) + c('O',15,10,1.5),
 'T6': calls([G_route, ('O',12,8,1.5)] + [('S',10,8,1.0)]*6 + [('O',20,10,1.0)]*2 + [('O',25,10,3), G_final]) + 2*c(*VERIF_H),
}
# A': mesma topologia um degrau abaixo: Geral Sonnet -> setor Sonnet -> operários Haiku.
def degrau(m): return {'O':'S','S':'H','H':'H'}[m]
def rebaixa(lst): return [(degrau(m),a,b,o) for (m,a,b,o) in lst]
G_route2=('S',8,1.5,0.3); G_final2=('S',8,2,0.5)
D["A' mesma topologia: Geral Sonnet > setor Sonnet > Haiku"] = {
 'T1': c('S',10,3,0.5),
 'T2': calls([G_route2, ('S',12,4,1.0)] + [('H',8,3,0.4)]*3 + [('S',12,4,0.4), G_final2]) + c(*VERIF_H),
 'T3': calls([('S',10,2.5,0.3), ('H',8,2.5,0.3), ('S',10,1.5,0.2)]),
 'T4': calls([('S',12,5,0.8)] + [('H',8,4,0.4)]*3 + [('S',12,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('S',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('S',15,10,1.5),
 'T6': calls([G_route2, ('S',12,8,1.5)] + [('H',10,8,1.0)]*6 + [('S',20,10,1.0)]*2 + [('S',25,10,3), G_final2]) + 2*c(*VERIF_H),
}
# Alt 1: um orquestrador geral só (Opus), sem integrante-orquestrador; operários Haiku por ferramenta.
D['Alt1 orquestrador geral único (Opus) + operários Haiku'] = {
 'T1': 0.5*c(*ROUTER_H) + c('O',10,3,0.5),
 'T2': calls([('O',12,5,0.8),('O',14,3,0.4),('O',16,3,0.4),('O',18,3,0.6)]) + c(*VERIF_H),
 'T3': c('O',10,2.5,0.3) + c('H',0,6,0.3),
 'T4': calls([('O',12,5,0.8),('O',14,4,0.4),('O',16,4,0.5)]) + c('H',0,6,0.4) + c(*VERIF_H),
 'T5': calls([('O',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('O',15,10,1.5),
 'T6': calls([('O',12,8,1.5)] + [('O',20,6,0.8)]*6 + [('O',25,10,3)]) + 5*c('H',5,8,1) + 2*c(*VERIF_H),
}
# Alt 2: integrante por setor = agente único em Haiku, sob contrato, portão; bloqueio -> Sonnet; 2º bloqueio -> Opus.
def cascata(h, s, o, pb1, pb2):  # pb1: taxa de bloqueio no Haiku; pb2: fração dos escalados que bloqueiam no Sonnet
    return h + pb1*(s + pb2*o)
D['Alt2 integrante único Haiku + portão, escala no bloqueio'] = {
 'T1': 0.5*c(*ROUTER_H) + cascata(c('H',10,3,0.5), c('S',10,4,0.5), c('O',10,4,0.5), 0.08, 0.2),
 'T2': cascata(calls([('H',10,5,0.8),('H',12,3,0.4),('H',14,3,0.4),('H',16,3,0.6)]) + c(*VERIF_H),
               calls([('S',10,7,0.8),('S',12,3,0.4),('S',14,3,0.4),('S',16,3,0.6)]) + c(*VERIF_H),
               calls([('O',10,7,0.8),('O',12,3,0.4),('O',14,3,0.4),('O',16,3,0.6)]), 0.15, 0.2),
 'T3': cascata(c('H',10,2.5,0.3)+c(*VERIF_H)*0.3, c('S',10,3.5,0.3), c('O',10,3.5,0.3), 0.08, 0.2),
 'T4': cascata(calls([('H',12,5,0.8),('H',14,4,0.4),('H',16,4,0.5)]) + c(*VERIF_H),
               calls([('S',12,7,0.8),('S',14,4,0.4),('S',16,4,0.5)]) + c(*VERIF_H),
               calls([('O',12,7,0.8),('O',14,4,0.4),('O',16,4,0.5)]), 0.15, 0.2),
 'T5': cascata(calls([('H',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('H',15,10,1.5),
               calls([('S',20,5,1.5)]) + c('S',15,10,1.5), 0, 0.15, 0),
 'T6': cascata(calls([('H',12,8,1.5)] + [('H',20,6,0.8)]*6 + [('H',25,10,3)]),
               calls([('S',12,10,1.5)] + [('S',20,6,0.8)]*6 + [('S',25,10,3)]) + 5*c('H',5,8,1),
               calls([('O',12,10,1.5)] + [('O',20,6,0.8)]*6 + [('O',25,10,3)]), 0.5, 0.3),
}
# Alt 3: roteador barato na frente; simples -> Haiku único; médio -> Sonnet único; complexo -> Opus orquestra + Haiku.
D['Alt3 roteador barato + Opus só no complexo'] = {
 'T1': c(*ROUTER_H) + c('H',10,3,0.5),
 'T2': c(*ROUTER_H) + calls([('S',10,5,0.8),('S',12,3,0.4),('S',14,3,0.4),('S',16,3,0.6)]) + c(*VERIF_H),
 'T3': c('H',10,2.5,0.3),
 'T4': c(*ROUTER_H) + calls([('S',12,5,0.8),('S',14,4,0.4),('S',16,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('O',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('O',15,10,1.5),
 'T6': c(*ROUTER_H) + calls([('O',12,8,1.5)] + [('O',20,6,0.8)]*3 + [('O',25,10,3)]) + 5*c('H',5,8,1) + 2*c(*VERIF_H),
}
# R: recomendado: camada sem modelo + roteador barato; repetitivo e simples -> operário Haiku sob contrato com portão
# (bloqueio -> Sonnet -> Opus/pessoa); multi-passo -> integrante do setor em Sonnet que delega leque a Haiku;
# Opus só em escalada e no trabalho longo de alto risco; o Geral encaminha sem reescrever.
D['R recomendado (camadas + contrato + portão)'] = {
 'T1': 0.5*c(*ROUTER_H) + 0.5*cascata(c('H',10,3,0.5), c('S',10,4,0.5), c('O',10,4,0.5), 0.08, 0.2),  # metade sai só como cartão de dados, sem modelo
 'T2': 0.5*c(*ROUTER_H) + calls([('S',10,5,0.8),('S',12,3,0.4),('S',14,3,0.4),('S',16,3,0.6)]) + c(*VERIF_H),
 'T3': cascata(c('H',10,2.5,0.3)+0.3*c(*VERIF_H), c('S',10,3.5,0.3), c('O',10,3.5,0.3), 0.08, 0.2),
 'T4': cascata(calls([('H',12,5,0.8),('H',14,4,0.4),('H',16,4,0.5)]) + c(*VERIF_H),
               calls([('S',12,7,0.8),('S',14,4,0.4),('S',16,4,0.5)]) + c(*VERIF_H),
               calls([('O',12,7,0.8),('O',14,4,0.4),('O',16,4,0.5)]), 0.15, 0.2),
 'T5': 6*cascata(c('H',5,6,0.8), c('S',5,7,0.8), 0, 0.10, 0) + c('S',15,6,1.0),  # plano fixo do job (sem planejador), consolidação em código + resumo
 'T6': calls([('S',12,8,1.5)] + [('S',20,6,0.8)]*4 + [('S',25,10,3)]) + 5*cascata(c('H',5,8,1), c('S',5,9,1),0,0.15,0) + 2*c(*VERIF_H)
       + 0.25*calls([('O',20,15,3)]),
}
MIX = {'T1':120,'T2':40,'T3':150,'T4':25,'T5':12,'T6':2}
import sys
base = D['B0 plano atual (Sonnet + filhos Haiku)']
def mensal(d, mixd=MIX): return sum(d[t]*n for t,n in mixd.items())
print('Custo por tarefa, R$ (estimativa)')
print('desenho'.ljust(58), *[t.rjust(7) for t in MIX], 'mês R$'.rjust(8), 'x B0'.rjust(6))
mb = mensal(base)
for k,d in D.items():
    m = mensal(d)
    print(k.ljust(58), *[f"{d[t]*CAMBIO:7.3f}" for t in MIX], f"{m*CAMBIO:8.1f}", f"{m/mb:6.2f}")
for nome, mx in [('mais chat', {'T1':250,'T2':80,'T3':80,'T4':15,'T5':8,'T6':3}), ('mais eventos', {'T1':60,'T2':20,'T3':400,'T4':50,'T5':20,'T6':1})]:
    print('\nSensibilidade:', nome, mx)
    mb2 = mensal(base, mx)
    for k,d in D.items():
        m = mensal(d, mx); print(k.ljust(58), f"{m*CAMBIO:8.1f}", f"{m/mb2:6.2f}")
# Parcela do orquestrador na ideia do dono (T2, T4)
a = D['A ideia do dono: Geral Opus > setor Opus > Sonnet']
t2_orq = calls([G_route, ('O',12,4,1.0), ('O',12,4,0.4), G_final]); t2 = a['T2']
t4_orq = calls([('O',12,5,0.8), ('O',12,4,0.5)]); t4 = a['T4']
print(f"\nParcela dos orquestradores na ideia do dono: T2 {t2_orq/t2:.0%}, T4 {t4_orq/t4:.0%}")
print(f"Só o Geral (rotear+sintetizar) em T2: {calls([G_route,G_final])/t2:.0%}")

# ---- Critérios novos (erro primeiro; caro com contexto leve; procedimentos padronizados) ----
OPUS_REV = ('O', 3, 3, 0.4)   # revisão do caro sobre resultado compacto (esquema + evidências), sem histórico
D2 = {}
D2['B0 plano atual'] = base
D2['A ideia literal (Assistente Opus > setor Opus > Sonnet)'] = D['A ideia do dono: Geral Opus > setor Opus > Sonnet']
D2["X orquestrador LLM escondido no setor (Sonnet > Haiku)"] = D["A' mesma topologia: Geral Sonnet > setor Sonnet > Haiku"]
D2['Q qualidade máxima ingênua (Opus único por setor, contexto cheio)'] = D['Alt1 orquestrador geral único (Opus) + operários Haiku']
# P: procedimento em código (orquestrador escondido determinístico) + operários Haiku com esquema + regras;
# Sonnet escreve o que a pessoa lê a partir de resultado compacto; Opus revisa resultado compacto quando há risco.
D2['P recomendado: procedimento + operários + revisão compacta'] = {
 'T1': 0.5*c(*ROUTER_H) + 0.5*c('S',6,1.5,0.3),                        # metade só cartão; resto Sonnet curto sobre dado compacto
 'T2': 0.5*c(*ROUTER_H) + c('H',4,3,0.4) + calls([('S',6,2.5,0.5),('S',7,1.5,0.3)]) + 0.3*c(*OPUS_REV),
 'T3': c('H',6,2.5,0.3) + 0.2*c('S',4,2,0.3) + 0.02*c(*OPUS_REV),       # 20% sinalizados pelo validador vão ao Sonnet
 'T4': 2*c('H',5,3,0.4) + c('S',7,3,0.6) + 0.5*c(*OPUS_REV),
 'T5': 6*cascata(c('H',5,6,0.8), c('S',5,7,0.8), 0, 0.10, 0) + c('S',6,4,0.8) + 0.3*c(*OPUS_REV),
 'T6': calls([('S',12,8,1.5)] + [('S',15,5,0.8)]*3 + [('S',15,6,2.5)]) + 5*cascata(c('H',5,8,1), c('S',5,9,1),0,0.15,0)
       + c('O',6,8,1.0),
}
print('\n=== Critérios novos ===')
print('desenho'.ljust(66), *[t.rjust(7) for t in MIX], 'mês R$'.rjust(8), 'x B0'.rjust(6), 'marg.Op'.rjust(8))
for k,d in D2.items():
    m = mensal(d); custo = m*CAMBIO + 14
    print(k.ljust(66), *[f"{d[t]*CAMBIO:7.3f}" for t in MIX], f"{m*CAMBIO:8.1f}", f"{m/mb:6.2f}", f"{(189-custo)/189:8.1%}")
print('Revisão Opus compacta, R$ por chamada:', round(c(*OPUS_REV)*CAMBIO,3))
print('Consolidação de memória Haiku por integrante/dia, R$:', round(c('H',0,10,0.5)*CAMBIO,4))
print('Falta de cache de 12k no Sonnet (escrita 1,25x vs leitura), R$ por chamada:', round((12*2.5-12*0.10)/1000*CAMBIO,3))

# ---- Segundo planejador: substitui execução cara ou só acrescenta camada? ----
R = CAMBIO
casos = {}
# Caso (a): sem o orquestrador do setor, quem executa é o Assistente em Opus, com contexto cheio.
a0 = D['Alt1 orquestrador geral único (Opus) + operários Haiku']
a1 = {  # Assistente Opus só roteia (não reescreve) -> orquestrador do setor Sonnet -> operários Haiku -> revisão Sonnet
 'T2': c(*G_route) + calls([('S',12,4,1.0)] + [('H',8,3,0.4)]*3 + [('S',12,4,0.4)]) + c(*VERIF_H),
 'T4': calls([('S',12,5,0.8)] + [('H',8,4,0.4)]*3 + [('S',12,4,0.5)]) + c(*VERIF_H),   # evento não passa pelo Assistente
 'T5': calls([('S',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('S',15,10,1.5),
 'T6': c(*G_route) + calls([('S',12,8,1.5)] + [('H',10,8,1.0)]*6 + [('S',20,10,1.0)]*2 + [('S',25,10,3)]) + 2*c(*VERIF_H),
}
# Caso (b): o Assistente Opus já planeja e despacha operários; o setor acrescenta mais um planejador e uma revisão.
b0 = {  # um nível: Assistente Opus planeja -> operários Sonnet -> Assistente revisa
 'T2': calls([('O',12,4,1.0)] + [('S',8,3,0.4)]*3 + [('O',12,4,0.4)]) + c(*VERIF_H),
 'T4': calls([('O',12,5,0.8)] + [('S',8,4,0.4)]*3 + [('O',12,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('O',20,5,1.5)]) + 6*c('S',5,6,0.8) + c('O',15,10,1.5),
 'T6': calls([('O',12,8,1.5)] + [('S',10,8,1.0)]*6 + [('O',20,10,1.0)]*2 + [('O',25,10,3)]) + 2*c(*VERIF_H),
}
b1 = {  # dois níveis: Assistente Opus planeja -> setor Opus replaneja -> operários Sonnet -> setor revisa -> Assistente revisa
 'T2': calls([('O',12,4,1.0), ('O',12,4,1.0)] + [('S',8,3,0.4)]*3 + [('O',12,4,0.4), ('O',12,4,0.4)]) + c(*VERIF_H),
 'T4': calls([('O',12,5,0.8), ('O',12,5,0.8)] + [('S',8,4,0.4)]*3 + [('O',12,4,0.5), ('O',12,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('O',20,5,1.5), ('O',20,5,1.5)]) + 6*c('S',5,6,0.8) + 2*c('O',15,10,1.5),
 'T6': calls([('O',12,8,1.5)]*2 + [('S',10,8,1.0)]*6 + [('O',20,10,1.0)]*4 + [('O',25,10,3)]*2) + 2*c(*VERIF_H),
}
b1s = {  # idem com o planejador do setor em Sonnet e operários Haiku
 'T2': calls([('O',12,4,1.0), ('S',12,4,1.0)] + [('H',8,3,0.4)]*3 + [('S',12,4,0.4), ('O',12,4,0.4)]) + c(*VERIF_H),
 'T4': calls([('S',12,5,0.8)] + [('H',8,4,0.4)]*3 + [('S',12,4,0.5)]) + c(*VERIF_H),
 'T5': calls([('S',20,5,1.5)]) + 6*c('H',5,6,0.8) + c('S',15,10,1.5),
 'T6': calls([('O',12,8,1.5), ('S',12,8,1.5)] + [('H',10,8,1.0)]*6 + [('S',20,10,1.0)]*2 + [('S',25,10,3), ('O',20,10,1.0)]) + 2*c(*VERIF_H),
}
print('\n=== Segundo planejador (R$ por tarefa) ===')
print('caso'.ljust(70), *[t.rjust(7) for t in ['T2','T4','T5','T6']])
for nome, d in [('(a0) Assistente Opus executa sozinho', a0), ('(a1) Assistente roteia; setor Sonnet planeja; Haiku executa', a1),
                ('(b0) Assistente Opus planeja; Sonnet executa (1 nível)', b0), ('(b1) + setor Opus replaneja e revisa (2 níveis)', b1),
                ('(b1s) + setor Sonnet replaneja; Haiku executa', b1s), ('B0 plano atual (Sonnet executa, sem planejador)', base),
                ('P recomendado', D2['P recomendado: procedimento + operários + revisão compacta'])]:
    print(nome.ljust(70), *[f"{d[t]*R:7.3f}" for t in ['T2','T4','T5','T6']])
# custo por tarefa resolvida com taxas hipotéticas
print('\nCusto por tarefa resolvida, T2, se a taxa de acerto for:')
for nome, d, acc in [('B0',base,0.95),('A literal',D['A ideia do dono: Geral Opus > setor Opus > Sonnet'],0.97),('P',D2['P recomendado: procedimento + operários + revisão compacta'],0.95),('P pior',D2['P recomendado: procedimento + operários + revisão compacta'],0.92)]:
    print(f"  {nome:10s} acerto {acc:.0%}: R$ {d['T2']*R/acc:.3f}")
