/**
 * Grupos econômicos de exemplo (S01-A78; 03, 3.4; CIC-009). Dados fictícios do
 * escritório de demonstração. No banco, `cliente.grupo_economico_id` aponta o
 * grupo; enquanto a entidade Grupo econômico não existe na migração, os grupos
 * moram aqui (registrado em DECISOES.md, S01).
 *
 * Grupo é rótulo, não permissão: quem não vê uma empresa do grupo vê "2 de 4
 * empresas visíveis".
 */
export interface GrupoEconomico {
  id: string
  nome: string
  /** Empresa que recebe a cobrança consolidada (`cliente_principal`). */
  principal: string
  empresas: string[]
}

export const gruposEconomicos: GrupoEconomico[] = [
  { id: 'ge-andrade', nome: 'Grupo Andrade', principal: 'c1', empresas: ['c1', 'c5', 'c6'] },
  { id: 'ge-varejo', nome: 'Grupo Bela Vista', principal: 'c3', empresas: ['c3', 'c2', 'c7', 'c8'] },
]
