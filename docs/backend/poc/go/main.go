// Prova de conceito: os dois endpoints da medição em Go (net/http + pgx + golang-jwt).
package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Claims struct {
	AppMetadata struct {
		EscritorioID string `json:"escritorio_id"`
	} `json:"app_metadata"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

var pool *pgxpool.Pool
var chave any

func claims(r *http.Request) (*Claims, string, error) {
	t := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	c := &Claims{}
	_, err := jwt.ParseWithClaims(t, c, func(*jwt.Token) (any, error) { return chave, nil }, jwt.WithValidMethods([]string{"ES256"}))
	if err != nil {
		return nil, "", err
	}
	raw, _ := json.Marshal(map[string]any{"sub": c.Subject, "role": c.Role, "app_metadata": map[string]string{"escritorio_id": c.AppMetadata.EscritorioID}})
	return c, string(raw), nil
}

func fixar(ctx context.Context, tx pgx.Tx, raw string) error {
	_, err := tx.Exec(ctx, "select set_config('request.jwt.claims', $1, true), set_config('role', 'authenticated', true)", raw)
	return err
}

type Tarefa struct {
	ID            string          `json:"id"`
	Titulo        string          `json:"titulo"`
	ClienteID     string          `json:"cliente_id"`
	SetorID       string          `json:"setor_id"`
	AtividadeID   string          `json:"atividade_id"`
	Status        string          `json:"status"`
	ResponsavelID *string         `json:"responsavel_id"`
	PrazoInterno  time.Time       `json:"prazo_interno"`
	PrazoLegal    *time.Time      `json:"prazo_legal"`
	Extras        json.RawMessage `json:"extras"`
}

func listar(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, raw, err := claims(r)
	if err != nil {
		http.Error(w, "token", 401)
		return
	}
	setor := r.URL.Query().Get("setor")
	if setor == "" {
		setor = "fiscal"
	}
	tx, err := pool.Begin(ctx)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer tx.Rollback(ctx)
	if err := fixar(ctx, tx, raw); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rows, _ := tx.Query(ctx, `select id, titulo, cliente_id, setor_id, atividade_id, status, responsavel_id, prazo_interno, prazo_legal, extras
      from tarefa where setor_id = $1 and status in ('a_fazer','em_andamento','aguardando_cliente','em_revisao')
      order by prazo_interno limit 50`, setor)
	lista, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (Tarefa, error) {
		var t Tarefa
		err := row.Scan(&t.ID, &t.Titulo, &t.ClienteID, &t.SetorID, &t.AtividadeID, &t.Status, &t.ResponsavelID, &t.PrazoInterno, &t.PrazoLegal, &t.Extras)
		return t, err
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tx.Commit(ctx)
	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"dados": lista})
}

func concluir(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	c, raw, err := claims(r)
	if err != nil {
		http.Error(w, "token", 401)
		return
	}
	esc := c.AppMetadata.EscritorioID
	tx, err := pool.Begin(ctx)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer tx.Rollback(ctx)
	if err := fixar(ctx, tx, raw); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	var id, cliente, setor, status, titulo string
	err = tx.QueryRow(ctx, `update tarefa set status = case when status = 'concluida' then 'em_andamento' else 'concluida' end, atualizado_em = now()
      where id = $1 returning id, cliente_id, setor_id, status, titulo`, r.PathValue("id")).Scan(&id, &cliente, &setor, &status, &titulo)
	if err == pgx.ErrNoRows {
		http.Error(w, `{"erro":"tarefa não encontrada"}`, 404)
		return
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	var seq int64
	var ultimo []byte
	if err := tx.QueryRow(ctx, "select seq, ultimo_hash from cadeia_evento for update").Scan(&seq, &ultimo); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	seq++
	nome := "tarefa.iniciar"
	if status == "concluida" {
		nome = "tarefa.concluir"
	}
	h := sha256.New()
	h.Write(ultimo)
	fmt.Fprintf(h, "%s|%d|%s|%s|%s", esc, seq, nome, c.Subject, id)
	hash := h.Sum(nil)
	if _, err := tx.Exec(ctx, `insert into evento (escritorio_id, seq, nome, ator_tipo, ator_id, cliente_id, setor_id, ferramenta, nivel, resultado, resultado_ref, origem, texto, hash_anterior, hash)
      values ($1, $2, $3, 'pessoa', $4, $5, $6, $3, 'executar', 'ok', $7, 'tela', $8, $9, $10)`, esc, seq, nome, c.Subject, cliente, setor, id, "concluiu "+titulo, ultimo, hash); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if _, err := tx.Exec(ctx, "update cadeia_evento set seq = $1, ultimo_hash = $2", seq, hash); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if err := tx.Commit(ctx); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"tarefa": map[string]string{"id": id, "cliente_id": cliente, "setor_id": setor, "status": status, "titulo": titulo}, "evento_seq": fmt.Sprint(seq)})
}

func main() {
	pem, _ := os.ReadFile("../pub.pem")
	var err error
	chave, err = jwt.ParseECPublicKeyFromPEM(pem)
	if err != nil {
		panic(err)
	}
	cfg, _ := pgxpool.ParseConfig("postgres://app_api@127.0.0.1:5433/heild?pool_max_conns=20")
	pool, err = pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		panic(err)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /v1/tarefas", listar)
	mux.HandleFunc("POST /v1/tarefas/{id}/concluir", concluir)
	porta := os.Getenv("PORTA")
	if porta == "" {
		porta = "8082"
	}
	http.ListenAndServe("127.0.0.1:"+porta, mux)
}
