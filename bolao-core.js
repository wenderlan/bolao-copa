/* Núcleo compartilhado entre a página de view e a de edit.
   Não coloque a chave de escrita aqui: este arquivo é público.
   Só o ID do bin (leitura) fica neste arquivo. */

const BIN_ID = "6a2af213da38895dfeaf500b";

const API_BASE = "https://api.jsonbin.io/v3/b/" + BIN_ID;

function estadoPadrao() {
  return { valorAposta: 2, palpites: [], placarReal: null };
}

async function buscarEstado() {
  const resp = await fetch(API_BASE + "/latest", {
    headers: { "X-Bin-Meta": "false" },
    cache: "no-store"
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  const dados = await resp.json();
  return normalizar(dados);
}

async function salvarEstado(estado, masterKey) {
  const resp = await fetch(API_BASE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": masterKey
    },
    body: JSON.stringify(estado)
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  return true;
}

function normalizar(dados) {
  const base = estadoPadrao();
  if (!dados || typeof dados !== "object") return base;
  return {
    valorAposta: typeof dados.valorAposta === "number" ? dados.valorAposta : base.valorAposta,
    palpites: Array.isArray(dados.palpites) ? dados.palpites : [],
    placarReal: dados.placarReal || null
  };
}

function dinheiro(v) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function vencedores(estado) {
  if (!estado.placarReal) return [];
  return estado.palpites.filter(p =>
    p.golsBr === estado.placarReal.br && p.golsAdv === estado.placarReal.adv
  );
}

function calcularResumo(estado) {
  const pagos = estado.palpites.filter(p => p.pagou).length;
  const pendentes = estado.palpites.length - pagos;
  return {
    total: estado.palpites.length,
    pagos: pagos,
    pendentes: pendentes,
    arrecadado: pagos * estado.valorAposta,
    pendente: pendentes * estado.valorAposta,
    premio: pagos * estado.valorAposta
  };
}

function escapar(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : s;
  return d.innerHTML;
}

function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
