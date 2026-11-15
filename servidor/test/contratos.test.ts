import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { catalogo, ferramentasTipadas, Repositorio } from '@heild/dominio'
import { PASTA_CONTRATOS, textoDosContratos } from '../src/contratos.ts'
import { operacoes } from '../src/executor/operacoes.ts'

/** Contratos gerados de uma fonte só (AGENTICO 3 e 7), conferidos como no CI. */

describe('catálogo das ferramentas tipadas', () => {
  it('todo esquema de entrada é estrito (additionalProperties: false), inclusive os objetos de dentro', () => {
    const abertos: string[] = []
    const andar = (s: any, onde: string) => {
      if (!s || typeof s !== 'object') return
      if (s.type === 'object' && s.additionalProperties !== false) abertos.push(onde)
      for (const [k, v] of Object.entries(s.properties ?? {})) andar(v, `${onde}.${k}`)
      if (s.items) andar(s.items, `${onde}[]`)
    }
    for (const f of ferramentasTipadas) andar(z.toJSONSchema(f.entrada, { io: 'input' }), f.nome)
    expect(abertos).toEqual([])
  })

  it('toda escrita aponta para uma operação de repositório registrada', () => {
    for (const f of ferramentasTipadas) {
      if (f.tipo !== 'escrita') continue
      const exemplo = f.chamada(new Proxy({}, { get: () => 'x' }) as never)
      expect(operacoes.has(exemplo.operacao), `${f.nome} → ${exemplo.operacao}`).toBe(true)
    }
  })

  it('toda leitura autoriza com uma ferramenta do catálogo, no nível ler', () => {
    const porNome = new Map(catalogo.map((c) => [c.nome, c]))
    for (const f of ferramentasTipadas) if (f.tipo === 'leitura') expect(porNome.get(f.autorizar_com)?.nivel, f.nome).toBe('ler')
  })

  it('toda ferramenta de escrita do catálogo usada pelos repositórios existe no catálogo', () => {
    const nomes = new Set(catalogo.map((c) => c.nome))
    const faltando = new Set<string>()
    for (const op of operacoes.values()) if (op.repositorio instanceof Repositorio) for (const f of Object.values(op.repositorio.regras.ferramentas)) if (f && !nomes.has(f)) faltando.add(f)
    expect([...faltando]).toEqual([])
  })
})

describe('retrato dos contratos', () => {
  it('servidor/contratos está em dia com pacotes/dominio (rode npm run contratos)', () => {
    for (const [nome, texto] of Object.entries(textoDosContratos())) {
      expect(readFileSync(path.join(PASTA_CONTRATOS, nome), 'utf8'), nome).toBe(texto)
    }
  })
})
