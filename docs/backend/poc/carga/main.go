// Gerador de carga: N trabalhadores, duração fixa, tokens de 100 escritórios sorteados; mede vazão e latência.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"
)

func main() {
	url := flag.String("url", "http://127.0.0.1:8081", "")
	modo := flag.String("modo", "ler", "ler | escrever | misto (80% ler)")
	conc := flag.Int("c", 64, "")
	dur := flag.Duration("d", 20*time.Second, "")
	flag.Parse()
	b, _ := os.ReadFile("../tokens.json")
	var tokens []string
	json.Unmarshal(b, &tokens)
	tr := &http.Transport{MaxIdleConnsPerHost: *conc, MaxConnsPerHost: *conc}
	cli := &http.Client{Transport: tr, Timeout: 10 * time.Second}
	setores := []string{"fiscal", "dp", "contabil", "societario", "notas"}
	var mu sync.Mutex
	var lat []time.Duration
	erros := 0
	fim := time.Now().Add(*dur)
	var wg sync.WaitGroup
	for w := 0; w < *conc; w++ {
		wg.Add(1)
		go func(w int) {
			defer wg.Done()
			r := rand.New(rand.NewSource(int64(w)))
			local := make([]time.Duration, 0, 100000)
			e := 0
			for time.Now().Before(fim) {
				tk := tokens[r.Intn(len(tokens))]
				var req *http.Request
				escrever := *modo == "escrever" || (*modo == "misto" && r.Intn(10) < 2)
				if escrever {
					req, _ = http.NewRequest("POST", fmt.Sprintf("%s/v1/tarefas/tk%d/concluir", *url, 1+r.Intn(20000)), nil)
				} else {
					req, _ = http.NewRequest("GET", fmt.Sprintf("%s/v1/tarefas?setor=%s", *url, setores[r.Intn(5)]), nil)
				}
				req.Header.Set("Authorization", "Bearer "+tk)
				t0 := time.Now()
				resp, err := cli.Do(req)
				if err != nil {
					e++
					continue
				}
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
				if resp.StatusCode != 200 {
					e++
					continue
				}
				local = append(local, time.Since(t0))
			}
			mu.Lock()
			lat = append(lat, local...)
			erros += e
			mu.Unlock()
		}(w)
	}
	wg.Wait()
	sort.Slice(lat, func(i, j int) bool { return lat[i] < lat[j] })
	p := func(q float64) float64 { return float64(lat[int(float64(len(lat)-1)*q)].Microseconds()) / 1000 }
	fmt.Printf("%s\t%d req/s\tp50 %.1f ms\tp99 %.1f ms\terros %d\n", *modo, int(float64(len(lat))/dur.Seconds()), p(0.5), p(0.99), erros)
}
