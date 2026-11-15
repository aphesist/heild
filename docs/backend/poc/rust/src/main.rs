// Prova de conceito: os dois endpoints da medição em Rust (axum + tokio-postgres + deadpool + jsonwebtoken).
use axum::{extract::{Path, Query, State}, http::{HeaderMap, StatusCode}, routing::{get, post}, Json, Router};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{collections::HashMap, sync::Arc};

#[derive(Deserialize, Serialize, Clone)]
struct AppMeta { escritorio_id: String }
#[derive(Deserialize, Serialize, Clone)]
struct Claims { sub: String, role: String, app_metadata: AppMeta, exp: u64 }

struct Estado { pool: Pool, chave: DecodingKey, validacao: Validation }
type S = State<Arc<Estado>>;
type Resp = Result<Json<Value>, (StatusCode, String)>;

fn erro<E: std::fmt::Display>(e: E) -> (StatusCode, String) { (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()) }

fn claims(st: &Estado, h: &HeaderMap) -> Result<(Claims, String), (StatusCode, String)> {
    let t = h.get("authorization").and_then(|v| v.to_str().ok()).unwrap_or("").trim_start_matches("Bearer ");
    let c = decode::<Claims>(t, &st.chave, &st.validacao).map_err(|_| (StatusCode::UNAUTHORIZED, "token".into()))?.claims;
    let raw = serde_json::to_string(&json!({"sub": c.sub, "role": c.role, "app_metadata": c.app_metadata})).unwrap();
    Ok((c, raw))
}

#[derive(Serialize)]
struct Tarefa { id: String, titulo: String, cliente_id: String, setor_id: String, atividade_id: String, status: String,
    responsavel_id: Option<String>, prazo_interno: chrono::NaiveDate, prazo_legal: Option<chrono::NaiveDate>, extras: Option<Value> }

async fn listar(State(st): S, h: HeaderMap, Query(q): Query<HashMap<String, String>>) -> Resp {
    let (_, raw) = claims(&st, &h)?;
    let setor = q.get("setor").cloned().unwrap_or_else(|| "fiscal".into());
    let mut cli = st.pool.get().await.map_err(erro)?;
    let tx = cli.transaction().await.map_err(erro)?;
    let fixar = tx.prepare_cached("select set_config('request.jwt.claims', $1, true), set_config('role', 'authenticated', true)").await.map_err(erro)?;
    tx.execute(&fixar, &[&raw]).await.map_err(erro)?;
    let sel = tx.prepare_cached("select id, titulo, cliente_id, setor_id, atividade_id, status, responsavel_id, prazo_interno, prazo_legal, extras
      from tarefa where setor_id = $1 and status in ('a_fazer','em_andamento','aguardando_cliente','em_revisao')
      order by prazo_interno limit 50").await.map_err(erro)?;
    let linhas = tx.query(&sel, &[&setor]).await.map_err(erro)?;
    tx.commit().await.map_err(erro)?;
    let dados: Vec<Tarefa> = linhas.iter().map(|r| Tarefa { id: r.get(0), titulo: r.get(1), cliente_id: r.get(2), setor_id: r.get(3),
        atividade_id: r.get(4), status: r.get(5), responsavel_id: r.get(6), prazo_interno: r.get(7), prazo_legal: r.get(8), extras: r.get(9) }).collect();
    Ok(Json(json!({ "dados": dados })))
}

async fn concluir(State(st): S, h: HeaderMap, Path(id): Path<String>) -> Resp {
    let (c, raw) = claims(&st, &h)?;
    let esc = c.app_metadata.escritorio_id.clone();
    let mut cli = st.pool.get().await.map_err(erro)?;
    let tx = cli.transaction().await.map_err(erro)?;
    let fixar = tx.prepare_cached("select set_config('request.jwt.claims', $1, true), set_config('role', 'authenticated', true)").await.map_err(erro)?;
    tx.execute(&fixar, &[&raw]).await.map_err(erro)?;
    let up = tx.prepare_cached("update tarefa set status = case when status = 'concluida' then 'em_andamento' else 'concluida' end, atualizado_em = now()
      where id = $1 returning id, cliente_id, setor_id, status, titulo").await.map_err(erro)?;
    let Some(t) = tx.query_opt(&up, &[&id]).await.map_err(erro)? else { return Err((StatusCode::NOT_FOUND, "tarefa não encontrada".into())) };
    let (tid, cliente, setor, status, titulo): (String, String, String, String, String) = (t.get(0), t.get(1), t.get(2), t.get(3), t.get(4));
    let cad_st = tx.prepare_cached("select seq, ultimo_hash from cadeia_evento for update").await.map_err(erro)?;
    let cad = tx.query_one(&cad_st, &[]).await.map_err(erro)?;
    let seq: i64 = cad.get::<_, i64>(0) + 1;
    let ultimo: Vec<u8> = cad.get(1);
    let nome = if status == "concluida" { "tarefa.concluir" } else { "tarefa.iniciar" };
    let mut hs = Sha256::new();
    hs.update(&ultimo);
    hs.update(format!("{}|{}|{}|{}|{}", esc, seq, nome, c.sub, tid).as_bytes());
    let hash = hs.finalize().to_vec();
    let ins = tx.prepare_cached("insert into evento (escritorio_id, seq, nome, ator_tipo, ator_id, cliente_id, setor_id, ferramenta, nivel, resultado, resultado_ref, origem, texto, hash_anterior, hash)
      values ($1, $2, $3, 'pessoa', $4, $5, $6, $3, 'executar', 'ok', $7, 'tela', $8, $9, $10)").await.map_err(erro)?;
    let texto = format!("concluiu {}", titulo);
    tx.execute(&ins, &[&esc, &seq, &nome, &c.sub, &cliente, &setor, &tid, &texto, &ultimo, &hash]).await.map_err(erro)?;
    let upc = tx.prepare_cached("update cadeia_evento set seq = $1, ultimo_hash = $2").await.map_err(erro)?;
    tx.execute(&upc, &[&seq, &hash]).await.map_err(erro)?;
    tx.commit().await.map_err(erro)?;
    Ok(Json(json!({ "tarefa": { "id": tid, "cliente_id": cliente, "setor_id": setor, "status": status, "titulo": titulo }, "evento_seq": seq.to_string() })))
}

#[tokio::main]
async fn main() {
    let pem = std::fs::read("../pub.pem").unwrap();
    let mut cfg = tokio_postgres::Config::new();
    cfg.host("127.0.0.1").port(5433).user("app_api").dbname("heild");
    let mgr = Manager::from_config(cfg, tokio_postgres::NoTls, ManagerConfig { recycling_method: RecyclingMethod::Fast });
    let pool = Pool::builder(mgr).max_size(20).build().unwrap();
    let mut validacao = Validation::new(Algorithm::ES256);
    validacao.required_spec_claims.clear();
    let st = Arc::new(Estado { pool, chave: DecodingKey::from_ec_pem(&pem).unwrap(), validacao });
    let app = Router::new().route("/v1/tarefas", get(listar)).route("/v1/tarefas/{id}/concluir", post(concluir)).with_state(st);
    let porta = std::env::var("PORTA").unwrap_or_else(|_| "8083".into());
    let l = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", porta)).await.unwrap();
    axum::serve(l, app).await.unwrap();
}
