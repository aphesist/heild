import { AreaRolagem } from '@/components/ui/area-rolagem'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Primitivos/Barra de rolagem',
  parameters: {
    docs: {
      description: {
        component:
          'A barra de rolagem é global (src/index.css): vale para toda área com overflow, sem componente. Para esconder numa faixa que rola de lado, use a classe `sem-barra`.',
      },
    },
  },
}
export default meta

const linhas = Array.from({ length: 40 }, (_, i) => `Linha ${i + 1} · Padaria Pão Quente ME · DAS 10/2026`)

export const Vertical: StoryObj = {
  render: () => (
    <AreaRolagem className="bg-card h-72 max-w-md rounded-lg p-4 text-sm">
      {linhas.map((l) => (
        <p key={l} className="py-1">
          {l}
        </p>
      ))}
    </AreaRolagem>
  ),
}

export const Horizontal: StoryObj = {
  render: () => (
    <AreaRolagem eixo="x" className="bg-card max-w-md rounded-lg p-4">
      <div className="flex w-[1400px] gap-2">
        {linhas.slice(0, 20).map((l) => (
          <span key={l} className="bg-muted shrink-0 rounded-full px-3 py-1 text-xs">
            {l}
          </span>
        ))}
      </div>
    </AreaRolagem>
  ),
}

export const SemBarra: StoryObj = {
  name: 'Sem barra (faixas)',
  render: () => (
    <AreaRolagem eixo="x" className="bg-card sem-barra max-w-md rounded-lg p-4">
      <div className="flex w-[1400px] gap-2">
        {linhas.slice(0, 20).map((l) => (
          <span key={l} className="bg-muted shrink-0 rounded-full px-3 py-1 text-xs">
            {l}
          </span>
        ))}
      </div>
    </AreaRolagem>
  ),
}
