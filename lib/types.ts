export type Moeda = "USD" | "BRL";

export type SerieMensal = {
  id: string;
  descricao: string;
  unidade: string;
  inicio: string;
  fim: string;
  parcialDesde?: string;
  fonte: { nome: string; url: string; licenca?: string; observacao?: string };
  valores: number[];
};

export type Ponto = { mes: string; valor: number };

export type Alta = {
  /** índice do fundo e do topo dentro da série visível */
  i0: number;
  i1: number;
  mes0: string;
  mes1: string;
  valor0: number;
  valor1: number;
  /** ganho total no período, em fração (1.33 = +133%) */
  ganho: number;
  meses: number;
  /** posição no ranking por ganho: 0 é a maior alta do período */
  rank: number;
  era: Era;
};

export type Era = {
  id: string;
  de: string;
  ate: string;
  titulo: string;
  explicacao: string;
};
