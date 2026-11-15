#!/usr/bin/env bash
# Sobe um Postgres 16 local, só para desenvolvimento e testes da B2, e aplica as migrações.
# Uso: bash scripts/banco-local.sh [--recriar]
# Variáveis: HEILD_PG_DIR (padrão .banco-local), HEILD_PG_PORTA (padrão 54329).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")/.." && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
DIR="${HEILD_PG_DIR:-$AQUI/.banco-local}"
PORTA="${HEILD_PG_PORTA:-54329}"
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
[ -n "$BIN" ] || BIN="$(dirname "$(command -v pg_ctl)")"
COMO=""
if [ "$(id -u)" = "0" ]; then COMO="sudo -u postgres"; fi

if [ "${1:-}" = "--recriar" ] && [ -d "$DIR" ]; then
  $COMO "$BIN/pg_ctl" -D "$DIR" stop -m fast >/dev/null 2>&1 || true
  rm -rf "$DIR"
fi
if [ ! -d "$DIR" ]; then
  mkdir -p "$DIR"; [ -n "$COMO" ] && chown postgres "$DIR"
  $COMO "$BIN/initdb" -D "$DIR" -U postgres --auth=trust -E UTF8 --locale=C.UTF-8 >/dev/null
fi
if ! $COMO "$BIN/pg_ctl" -D "$DIR" status >/dev/null 2>&1; then
  $COMO "$BIN/pg_ctl" -D "$DIR" -o "-p $PORTA -k /tmp -c listen_addresses=localhost -c max_connections=200" -l "$DIR/log.txt" start -w >/dev/null
fi
PSQL="psql -h localhost -p $PORTA -U postgres -v ON_ERROR_STOP=1 -q"
if ! $PSQL -d postgres -tAc "select 1 from pg_database where datname='heild'" | grep -q 1; then
  $PSQL -d postgres -c "create database heild"
  $PSQL -d heild -f "$AQUI/sql/00_shim_supabase_local.sql"
  for m in "$RAIZ"/app/supabase/migrations/*.sql; do $PSQL -d heild -f "$m" >/dev/null; done
  echo "Banco criado e migrações aplicadas."
fi
echo "DATABASE_URL=postgres://postgres@localhost:$PORTA/heild"
