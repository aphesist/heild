#!/usr/bin/env bash
# Postgres local da Heild para desenvolvimento (sem Docker): usa o binário do sistema
# (apt install postgresql-16, ou qualquer Postgres 16+ no PATH ou em /usr/lib/postgresql/*/bin).
#
#   scripts/pg-local.sh iniciar   cria o cluster em servidor/.pgdata (na primeira vez) e sobe na porta 54329
#   scripts/pg-local.sh parar     desliga
#   scripts/pg-local.sh estado    diz se está no ar
#   scripts/pg-local.sh apagar    desliga e apaga o cluster (dados de demonstração somem)
#
# Variáveis: HEILD_PG_PORTA (padrão 54329), HEILD_PG_DADOS (padrão servidor/.pgdata).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")/.." && pwd)"
PORTA="${HEILD_PG_PORTA:-54329}"
DADOS="${HEILD_PG_DADOS:-$AQUI/.pgdata}"
BIN="$(dirname "$(command -v pg_ctl 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/pg_ctl 2>/dev/null | sort -V | tail -1)")"
[ -x "$BIN/pg_ctl" ] || { echo "Não achei o pg_ctl. Instale o Postgres 16+ (apt install postgresql-16)." >&2; exit 1; }

# O Postgres não roda como root: em container (root), usa o usuário postgres do sistema.
como() { if [ "$(id -u)" = "0" ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }

case "${1:-iniciar}" in
  iniciar)
    if [ ! -f "$DADOS/PG_VERSION" ]; then
      mkdir -p "$DADOS"
      [ "$(id -u)" = "0" ] && chown postgres:postgres "$DADOS"
      como "'$BIN/initdb' -D '$DADOS' -U postgres --auth=trust --encoding=UTF8 --locale=C.UTF-8 >/dev/null"
      echo "Cluster criado em $DADOS."
    fi
    if como "'$BIN/pg_ctl' -D '$DADOS' status" >/dev/null 2>&1; then
      echo "Postgres já está no ar na porta $PORTA."
    else
      como "'$BIN/pg_ctl' -D '$DADOS' -o \"-p $PORTA -k /tmp -c listen_addresses=127.0.0.1\" -l '$DADOS/postgres.log' -w start" >/dev/null
      echo "Postgres no ar: postgres://postgres@127.0.0.1:$PORTA/postgres"
    fi
    ;;
  parar) como "'$BIN/pg_ctl' -D '$DADOS' -m fast stop" || true ;;
  estado) como "'$BIN/pg_ctl' -D '$DADOS' status" ;;
  apagar)
    como "'$BIN/pg_ctl' -D '$DADOS' -m fast stop" >/dev/null 2>&1 || true
    rm -rf "$DADOS" && echo "Cluster apagado."
    ;;
  *) echo "Uso: $0 iniciar|parar|estado|apagar" >&2; exit 2 ;;
esac
