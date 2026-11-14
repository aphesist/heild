import type { Meta, StoryObj } from '@storybook/react-vite'
import { MeuTempoTela } from './timesheet/MeuTempoTela'

const meta: Meta = { title: 'Telas/Timesheet', parameters: { layout: 'fullscreen' } }
export default meta

const fundo = (n: React.ReactNode) => <div className="from-background to-background-end h-dvh bg-gradient-to-b pt-4">{n}</div>

/** Membro (sem menu de configuração). O termo e a extensão vêm do banco: a Carla (u5) ainda não aceitou o termo. */
export const Membro: StoryObj = { name: 'Meu tempo · Membro', render: () => fundo(<MeuTempoTela papel="colaborador" />) }

/** Filtrado por um cliente (seletor do topo). */
export const UmCliente: StoryObj = { name: 'Meu tempo · um cliente', render: () => fundo(<MeuTempoTela papel="gestor" clienteNome="Metalúrgica Andrade Ltda" clienteId="c1" />) }
