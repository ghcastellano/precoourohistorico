import type { Era } from "./types";

/**
 * Contexto histórico usado apenas para NOMEAR as altas que o algoritmo detecta.
 * A detecção em si é 100% derivada dos dados (ver `rallies.ts`) — esta tabela
 * só empresta um título e uma explicação em linguagem simples ao período.
 */
export const ERAS: Era[] = [
  {
    id: "plaza",
    de: "1985-01",
    ate: "1988-12",
    titulo: "Acordo Plaza: o dólar enfraquece",
    explicacao:
      "As maiores economias do mundo combinaram derrubar o valor do dólar. Como o ouro é cotado em dólar, dólar fraco quase sempre significa ouro caro.",
  },
  {
    id: "asia-russia",
    de: "1997-06",
    ate: "1999-12",
    titulo: "Crise asiática, calote russo e a queda do real",
    explicacao:
      "Uma sequência de crises derrubou moedas de países emergentes. Em janeiro de 1999 o Brasil soltou o câmbio e o real desvalorizou de uma vez — o ouro, medido em reais, disparou.",
  },
  {
    id: "argentina",
    de: "2001-06",
    ate: "2003-06",
    titulo: "Apagão, crise argentina e a eleição de 2002",
    explicacao:
      "Racionamento de energia, o calote da Argentina e a incerteza da eleição presidencial fizeram o dólar quase dobrar no Brasil. Quem tinha ouro sentiu pouco.",
  },
  {
    id: "pos-bolha",
    de: "1999-01",
    ate: "2008-06",
    titulo: "Estouro da bolha da internet e o 11 de setembro",
    explicacao:
      "As bolsas despencaram, vieram os atentados de 2001 e duas guerras, e os juros americanos caíram a quase zero. Investidor com medo compra ouro — e comprou por quase dez anos seguidos.",
  },
  {
    id: "crise-2008",
    de: "2008-07",
    ate: "2013-06",
    titulo: "Crise financeira global e dinheiro impresso",
    explicacao:
      "Bancos quebraram em 2008 e os bancos centrais responderam imprimindo dinheiro em escala inédita. Quem temia que o dinheiro perdesse valor correu para o ouro.",
  },
  {
    id: "brasil-recessao",
    de: "2013-07",
    ate: "2016-12",
    titulo: "Recessão e crise política no Brasil",
    explicacao:
      "A economia brasileira encolheu dois anos seguidos e o dólar saiu de R$ 2 para quase R$ 4. Em dólares o ouro andou de lado; em reais, subiu bastante.",
  },
  {
    id: "juros-zero",
    de: "2017-01",
    ate: "2021-12",
    titulo: "Juros no chão, guerra comercial e a pandemia",
    explicacao:
      "Com juros baixíssimos, guardar dinheiro no banco deixou de render. Aí veio a COVID-19 em 2020 e o ouro bateu recorde atrás de recorde.",
  },
  {
    id: "inflacao-geopolitica",
    de: "2022-01",
    ate: "2027-12",
    titulo: "Inflação global, guerras e bancos centrais comprando ouro",
    explicacao:
      "A inflação voltou no mundo todo, conflitos se espalharam e — o ponto mais importante — os bancos centrais dos países passaram a comprar ouro em volume recorde para depender menos do dólar.",
  },
];

export const ERA_DESCONHECIDA: Era = {
  id: "outra",
  de: "",
  ate: "",
  titulo: "Período de alta",
  explicacao: "Um ciclo de valorização identificado diretamente pelos dados.",
};
