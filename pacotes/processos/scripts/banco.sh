#!/usr/bin/env bash
# Banco local da B2, com as ferramentas da B1: sobe o Postgres local (servidor/scripts/pg-local.sh,
# porta 54329) e aplica as migrações de app/supabase/migrations num banco próprio (padrão heild_b2),
# separado do `heild` da API e do `heild_teste` dos testes da B1.
# Uso: bash scripts/banco.sh [--recriar]
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../../.." && pwd)"
BANCO="${HEILD_PG_BANCO:-heild_b2}"
PORTA="${HEILD_PG_PORTA:-54329}"
bash "$RAIZ/servidor/scripts/pg-local.sh" iniciar >/dev/null
if [ "${1:-}" = "--recriar" ]; then
  psql -h 127.0.0.1 -p "$PORTA" -U postgres -d postgres -q -c "drop database if exists \"$BANCO\" with (force)"
fi
(cd "$RAIZ/servidor" && HEILD_PG_BANCO="$BANCO" npx tsx src/banco/migrar.ts)
echo "DATABASE_URL=postgres://postgres@127.0.0.1:$PORTA/$BANCO"
