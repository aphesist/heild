import { usePersistente } from '@/ambiente/loja'

/**
 * Complementos da assinatura (Estudo de precificação, ajustes de 7/11; 06, 11):
 * a marca branca é paga à parte (tema, domínio, remetente, app com a marca);
 * o app na loja (Apple e Google) é outro complemento. O App do cliente vem
 * incluído em todo plano.
 */
export interface Complementos {
  marca_branca: boolean
  app_loja: boolean
}

export const CHAVE_COMPLEMENTOS = 's09:assinatura:complementos'
export const complementosIniciais: Complementos = { marca_branca: true, app_loja: false }

export const precoComplemento: Record<keyof Complementos, string> = { marca_branca: 'R$ 290/mês', app_loja: 'R$ 190/mês + publicação' }

export function useComplementos() {
  return usePersistente<Complementos>(CHAVE_COMPLEMENTOS, complementosIniciais)
}

export function useMarcaBranca() {
  const [c] = useComplementos()
  return { contratada: c.marca_branca }
}
