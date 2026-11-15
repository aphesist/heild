#!/bin/bash
# Uso (de dentro da pasta do servidor): ../medir.sh <nome> <porta> <comando...>
# Servidor no núcleo 2, gerador de carga no núcleo 3, Postgres nos núcleos 0 e 1 (ver README.md).
raiz=$(cd "$(dirname "$0")" && pwd)
nome=$1; porta=$2; shift 2
PORTA=$porta GOMAXPROCS=1 TOKIO_WORKER_THREADS=1 UV_THREADPOOL_SIZE=1 taskset -c 2 "$@" > /dev/null 2>&1 &
pid=$!; sleep 2
tick=$(getconf CLK_TCK)
cpu() { awk '{print $14+$15}' /proc/$pid/stat; }
pgcpu() { for p in $(pgrep -u postgres); do awk '{s+=$14+$15} END{print s}' /proc/$p/stat; done | awk '{s+=$1} END{print s}'; }
(cd "$raiz/carga" && taskset -c 3 ./carga -url http://127.0.0.1:$porta -modo misto -c 64 -d 5s) > /dev/null   # aquecimento
for modo in ler escrever misto; do
  c0=$(cpu); g0=$(pgcpu)
  r=$(cd "$raiz/carga" && taskset -c 3 ./carga -url http://127.0.0.1:$porta -modo $modo -c 64 -d 20s)
  c1=$(cpu); g1=$(pgcpu)
  echo -e "$nome\t$r\tcpu_servidor $(( (c1-c0)*100/tick/20 ))%\tcpu_postgres $(( (g1-g0)*100/tick/20 ))%"
done
echo -e "$nome\tmemoria_pico $(grep VmHWM /proc/$pid/status | awk '{print $2/1024 " MB"}')\tmemoria_final $(grep VmRSS /proc/$pid/status | awk '{print $2/1024 " MB"}')"
kill $pid; wait $pid 2>/dev/null
