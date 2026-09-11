import { ERAS, ERA_DESCONHECIDA } from "./eras";
import { mesesEntre, somaMeses } from "./format";
import type { Alta, Era, Ponto } from "./types";

export const PARAMS = {
  /** Queda necessária, a partir de um topo, para considerar o ciclo encerrado. */
  reversao: 0.15,
  /** Ganho mínimo do fundo ao topo para o ciclo ser considerado uma "grande alta". */
  ganhoMinimo: 0.6,
  /** Duração mínima, em meses. Evita marcar solavancos curtos. */
  mesesMinimos: 12,
} as const;

type Pivo = { tipo: "F" | "T"; i: number; v: number };

/**
 * Detecta ciclos de alta com o método ZigZag: percorre a série guardando o
 * extremo corrente e só confirma um topo (ou um fundo) quando o preço reverte
 * `reversao` a partir dele. Cada par fundo → topo confirmado vira uma alta.
 *
 * É determinístico e não usa nenhuma data escolhida a dedo: mudar a moeda
 * ou estender a série simplesmente reexecuta o mesmo cálculo.
 */
export function detectarAltas(pontos: Ponto[]): Alta[] {
  if (pontos.length < 2) return [];
  const v = pontos.map((p) => p.valor);

  const pivos: Pivo[] = [];
  let subindo = true;
  let extI = 0;
  let extV = v[0];

  for (let i = 1; i < v.length; i++) {
    const x = v[i];
    if (subindo) {
      if (x > extV) { extV = x; extI = i; }
      else if (x <= extV * (1 - PARAMS.reversao)) {
        pivos.push({ tipo: "T", i: extI, v: extV });
        subindo = false; extV = x; extI = i;
      }
    } else {
      if (x < extV) { extV = x; extI = i; }
      else if (x >= extV * (1 + PARAMS.reversao)) {
        pivos.push({ tipo: "F", i: extI, v: extV });
        subindo = true; extV = x; extI = i;
      }
    }
  }
  pivos.push({ tipo: subindo ? "T" : "F", i: extI, v: extV });

  const brutas: Omit<Alta, "rank" | "era">[] = [];
  for (let k = 0; k < pivos.length - 1; k++) {
    const a = pivos[k];
    const b = pivos[k + 1];
    if (a.tipo !== "F" || b.tipo !== "T") continue;
    const ganho = b.v / a.v - 1;
    const meses = b.i - a.i;
    if (ganho < PARAMS.ganhoMinimo || meses < PARAMS.mesesMinimos) continue;
    brutas.push({
      i0: a.i, i1: b.i,
      mes0: pontos[a.i].mes, mes1: pontos[b.i].mes,
      valor0: a.v, valor1: b.v,
      ganho, meses,
    });
  }

  const ordenadas = [...brutas].sort((x, y) => y.ganho - x.ganho);
  return brutas.map((r) => ({
    ...r,
    rank: ordenadas.findIndex((o) => o.i0 === r.i0 && o.i1 === r.i1),
    era: eraDe(r.mes0, r.mes1),
  }));
}

/**
 * Escolhe a era que melhor cobre o intervalo da alta. O critério é a fração da
 * era coberta pela alta, então uma era estreita e específica ganha de uma era
 * ampla que apenas contém o período por acidente.
 */
function eraDe(mes0: string, mes1: string): Era {
  let melhor: Era = ERA_DESCONHECIDA;
  let melhorScore = 0;
  for (const era of ERAS) {
    const ini = maxMes(mes0, era.de);
    const fim = minMes(mes1, era.ate);
    const sobrepos = mesesEntre(ini, somaMeses(fim, 1));
    if (sobrepos <= 0) continue;
    const larguraEra = mesesEntre(era.de, somaMeses(era.ate, 1));
    const score = sobrepos / larguraEra;
    if (score > melhorScore) { melhorScore = score; melhor = era; }
  }
  return melhor;
}

const maxMes = (a: string, b: string) => (a > b ? a : b);
const minMes = (a: string, b: string) => (a < b ? a : b);

/** Maior queda de pico a vale da série, em fração negativa. */
export function maiorQueda(pontos: Ponto[]) {
  let pico = pontos[0].valor;
  let iPico = 0;
  let pior = { queda: 0, iPico: 0, iVale: 0 };
  for (let i = 1; i < pontos.length; i++) {
    const v = pontos[i].valor;
    if (v > pico) { pico = v; iPico = i; continue; }
    const q = v / pico - 1;
    if (q < pior.queda) pior = { queda: q, iPico, iVale: i };
  }
  return {
    queda: pior.queda,
    de: pontos[pior.iPico],
    ate: pontos[pior.iVale],
    meses: pior.iVale - pior.iPico,
  };
}

/**
 * Quantos meses o preço levou para voltar ao nível do primeiro mês da série.
 * Retorna null se nunca tiver ficado abaixo dele.
 */
export function tempoAteRecuperar(pontos: Ponto[]) {
  const inicial = pontos[0].valor;
  let caiu = false;
  for (let i = 1; i < pontos.length; i++) {
    if (pontos[i].valor < inicial) { caiu = true; continue; }
    if (caiu && pontos[i].valor >= inicial) {
      return { meses: i, ponto: pontos[i], inicial: pontos[0] };
    }
  }
  return null;
}
