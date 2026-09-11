import type { Moeda } from "./types";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "1980-01" -> "jan/1980" */
export function rotuloMes(mes: string): string {
  const [ano, m] = mes.split("-");
  return `${MESES[Number(m) - 1]}/${ano}`;
}

/** "1980-01" -> "janeiro de 1980" */
export function mesPorExtenso(mes: string): string {
  const nomes = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const [ano, m] = mes.split("-");
  return `${nomes[Number(m) - 1]} de ${ano}`;
}

export function anoDe(mes: string): number {
  return Number(mes.slice(0, 4));
}

/** Número de meses entre duas chaves "AAAA-MM". */
export function mesesEntre(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by * 12 + bm) - (ay * 12 + am);
}

/** Soma `n` meses a uma chave "AAAA-MM". */
export function somaMeses(mes: string, n: number): string {
  const [y, m] = mes.split("-").map(Number);
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

const SIMBOLO: Record<Moeda, string> = { USD: "US$", BRL: "R$" };

export function moeda(valor: number, m: Moeda, casas = 0): string {
  return `${SIMBOLO[m]} ${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}`;
}

/** Eixo Y: compacta 4.411 -> "4,4 mil" quando ajuda. */
export function eixoY(valor: number, m: Moeda): string {
  const s = SIMBOLO[m];
  if (valor >= 10000) return `${s} ${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  if (valor >= 1000) return `${s} ${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `${s} ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

export function pct(fracao: number, casas = 0): string {
  const v = fracao * 100;
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

export function vezes(multiplo: number): string {
  return `${multiplo.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}×`;
}

/** 122 -> "10 anos e 2 meses" */
export function duracao(meses: number): string {
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const pa = a === 1 ? "1 ano" : `${a} anos`;
  const pm = m === 1 ? "1 mês" : `${m} meses`;
  if (a === 0) return pm;
  if (m === 0) return pa;
  return `${pa} e ${pm}`;
}
