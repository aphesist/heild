# Hospedagem do wireframe

**15/11/2026.** O wireframe interativo é publicado na **Vercel** (plano Hobby), projeto `heild`, endereço provisório `heild-six.vercel.app`, até a compra do domínio `heild.com.br` (o painel vai para `painel.heild.com.br`, a landing para `heild.com.br`).

| Configuração | Valor |
| --- | --- |
| Repositório e branch de produção | `aphesist/heild`, branch `wireframe` (cada push publica sozinho) |
| Root Directory | `./` |
| Install Command | `cd app && npm ci` |
| Build Command | `cd app && npm run build` |
| Output Directory | `app/dist` |
| Variáveis | `VITE_HEILD_BANCO=local` por enquanto (dados no navegador de quem usa). Para dados compartilhados, o modo `supabase` com o projeto HEILD-PROD (São Paulo): URL, chave publicável e as contas de demonstração, com as senhas só nas variáveis da Vercel, nunca no repositório |

As rotas são por `#`, então não é preciso regra de reescrita no servidor.
