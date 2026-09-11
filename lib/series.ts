import ouroUsd from "@/data/gold-usd-monthly.json";
import usdBrl from "@/data/usdbrl-monthly.json";
import { mesesEntre, somaMeses } from "./format";
import type { Moeda, Ponto, SerieMensal } from "./types";

const OURO = ouroUsd as unknown as SerieMensal;
const CAMBIO = usdBrl as unknown as SerieMensal;

export const FONTES = {
  ouro: OURO.fonte,
  cambio: CAMBIO.fonte,
} as const;

export const ATUALIZADO_ATE = OURO.fim;
export const PARCIAL_DESDE = OURO.parcialDesde ?? null;

function serieUsd(): Ponto[] {
  return OURO.valores.map((valor, i) => ({
    mes: somaMeses(OURO.inicio, i),
    valor,
  }));
}

/**
 * Ouro em reais = ouro em dólares × dólar do mês.
 *
 * A série começa em jul/1994 porque o Real só passou a existir nessa data.
 * Converter os anos de cruzeiro/cruzado/cruzeiro real para "reais equivalentes"
 * é tecnicamente possível, mas a hiperinflação do período torna esses números
 * incomparáveis com os de hoje — então eles simplesmente não são mostrados.
 */
function serieBrl(): Ponto[] {
  const deslocamento = mesesEntre(OURO.inicio, CAMBIO.inicio);
  const pontos: Ponto[] = [];
  for (let j = 0; j < CAMBIO.valores.length; j++) {
    const ouro = OURO.valores[deslocamento + j];
    if (ouro === undefined) break;
    pontos.push({
      mes: somaMeses(CAMBIO.inicio, j),
      valor: ouro * CAMBIO.valores[j],
    });
  }
  return pontos;
}

const CACHE: Record<Moeda, Ponto[]> = {
  USD: serieUsd(),
  BRL: serieBrl(),
};

export function serie(moeda: Moeda): Ponto[] {
  return CACHE[moeda];
}

export const UNIDADE = "onça troy (31,1035 g)";
export const GRAMAS_POR_ONCA = 31.1035;

/** Dólar (BRL por USD) no mês indicado, ou o mais recente disponível. */
export function cambio(mes?: string): number {
  if (!mes) return CAMBIO.valores[CAMBIO.valores.length - 1];
  const j = mesesEntre(CAMBIO.inicio, mes);
  return CAMBIO.valores[j] ?? CAMBIO.valores[CAMBIO.valores.length - 1];
}

export const CAMBIO_INICIO = CAMBIO.inicio;
