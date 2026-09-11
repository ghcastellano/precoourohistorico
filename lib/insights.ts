import { duracao, mesesEntre, mesPorExtenso, moeda, pct, rotuloMes, vezes } from "./format";
import { detectarAltas, maiorQueda, tempoAteRecuperar } from "./rallies";
import { cambio, CAMBIO_INICIO, GRAMAS_POR_ONCA, serie } from "./series";
import type { Moeda } from "./types";

export type Insight = {
  titulo: string;
  texto: string;
  destaque?: string;
};

/**
 * Tudo aqui é calculado a partir da série, não escrito à mão — trocar a moeda
 * ou atualizar os dados reescreve os números sozinho.
 */
export function insights(m: Moeda): Insight[] {
  const pts = serie(m);
  const primeiro = pts[0];
  const ultimo = pts[pts.length - 1];
  const anos = mesesEntre(primeiro.mes, ultimo.mes) / 12;
  const multiplo = ultimo.valor / primeiro.valor;
  const aoAno = Math.pow(multiplo, 1 / anos) - 1;

  const altas = detectarAltas(pts);
  const maior = [...altas].sort((a, b) => b.ganho - a.ganho)[0];
  const queda = maiorQueda(pts);
  const recuperacao = tempoAteRecuperar(pts);

  const pico = pts.reduce((a, b) => (b.valor > a.valor ? b : a), pts[0]);
  const grama = ultimo.valor / GRAMAS_POR_ONCA;
  const dezMil = 10000 * multiplo;

  const out: Insight[] = [];

  out.push({
    titulo: "O básico: quanto multiplicou",
    destaque: vezes(multiplo),
    texto:
      `Uma onça de ouro custava ${moeda(primeiro.valor, m)} em ${mesPorExtenso(primeiro.mes)} ` +
      `e custa ${moeda(ultimo.valor, m)} agora. É ${vezes(multiplo)} em ${Math.round(anos)} anos, ` +
      `o equivalente a ${pct(aoAno, 1)} por ano, todo ano. ` +
      `Hoje o grama sai por cerca de ${moeda(grama, m, m === "BRL" ? 0 : 2)}.`,
  });

  out.push({
    titulo: "Traduzindo para o seu bolso",
    destaque: moeda(dezMil, m),
    texto:
      `${moeda(10000, m)} colocados em ouro em ${mesPorExtenso(primeiro.mes)} valeriam ` +
      `${moeda(dezMil, m)} hoje — sem contar inflação, imposto ou custo de guardar o metal. ` +
      `Não é dinheiro que "rende todo mês": é um preço que sobe e desce, e você só realiza o ganho quando vende.`,
  });

  if (maior) {
    out.push({
      titulo: "A maior alta do período",
      destaque: pct(maior.ganho),
      texto:
        `De ${rotuloMes(maior.mes0)} a ${rotuloMes(maior.mes1)} o ouro subiu ${pct(maior.ganho)} ` +
        `(${moeda(maior.valor0, m)} → ${moeda(maior.valor1, m)}), ao longo de ${duracao(maior.meses)}. ` +
        `${maior.era.explicacao}`,
    });
  }

  out.push({
    titulo: "A parte que quase ninguém conta",
    destaque: pct(queda.queda),
    texto:
      `A maior queda foi de ${pct(queda.queda)}, de ${rotuloMes(queda.de.mes)} a ${rotuloMes(queda.ate.mes)} ` +
      `— ${duracao(queda.meses)} caindo, saindo de ${moeda(queda.de.valor, m)} para ${moeda(queda.ate.valor, m)}. ` +
      `Ouro não é poupança: quem comprou no topo esperou anos para empatar.`,
  });

  if (recuperacao && recuperacao.meses >= 48) {
    out.push({
      titulo: "Paciência é parte do preço",
      destaque: duracao(recuperacao.meses),
      texto:
        `Quem comprou em ${mesPorExtenso(primeiro.mes)}, a ${moeda(recuperacao.inicial.valor, m)}, ` +
        `só viu esse valor de volta em ${mesPorExtenso(recuperacao.ponto.mes)} — ${duracao(recuperacao.meses)} depois. ` +
        `E isso sem descontar a inflação do período, que é enorme. O ouro protege no longo prazo, mas o "longo prazo" pode ser uma vida inteira.`,
    });
  }

  const noTopo = pico.mes === ultimo.mes;
  out.push({
    titulo: noTopo ? "O recorde é agora" : "Onde está o topo",
    destaque: moeda(pico.valor, m),
    texto: noTopo
      ? `O preço mais alto de toda a série é o de agora: ${moeda(pico.valor, m)}. Nunca esteve tão caro.`
      : `O recorde da série foi em ${mesPorExtenso(pico.mes)}, a ${moeda(pico.valor, m)}. ` +
        `De lá para cá o preço recuou ${pct(ultimo.valor / pico.valor - 1)} — um lembrete de que ` +
        `nem mesmo o ouro sobe em linha reta, e de que recorde não é piso.`,
  });

  if (m === "BRL") {
    const usd = serie("USD");
    const iniUsd = usd.find((p) => p.mes === primeiro.mes)!;
    const fimUsd = usd[usd.length - 1];
    const multUsd = fimUsd.valor / iniUsd.valor;
    const dolarIni = cambio(CAMBIO_INICIO);
    const dolarFim = cambio();
    out.push({
      titulo: "Por que em reais parece muito mais",
      destaque: `${vezes(multiplo)} contra ${vezes(multUsd)}`,
      texto:
        `No mesmo período o ouro multiplicou ${vezes(multUsd)} em dólares e ${vezes(multiplo)} em reais. ` +
        `A diferença não é o ouro subindo mais aqui: é o real perdendo valor frente ao dólar, ` +
        `que saiu de ${moeda(dolarIni, "BRL", 2)} em ${rotuloMes(CAMBIO_INICIO)} para ${moeda(dolarFim, "BRL", 2)} agora. ` +
        `Num gráfico em reais, boa parte da "alta" é a nossa moeda encolhendo.`,
    });
  } else {
    out.push({
      titulo: "Cuidado com o gráfico",
      destaque: "valores nominais",
      texto:
        `Todos os números aqui são nominais: nenhum foi corrigido pela inflação. ` +
        `Os US$ 675 de 1980 comprariam hoje muito mais do que US$ 675 compram — ` +
        `então a alta real, em poder de compra, é bem menor do que a linha sugere.`,
    });
  }

  return out;
}
