import Painel, { type DadosMoeda } from "@/components/Painel";
import { insights } from "@/lib/insights";
import { detectarAltas, maiorQueda } from "@/lib/rallies";
import { ATUALIZADO_ATE, FONTES, PARCIAL_DESDE, serie } from "@/lib/series";
import { rotuloMes } from "@/lib/format";
import type { Moeda } from "@/lib/types";

function montar(m: Moeda): DadosMoeda {
  const pontos = serie(m);
  const altas = detectarAltas(pontos);
  const queda = maiorQueda(pontos);
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  return {
    pontos,
    altas,
    insights: insights(m),
    resumo: {
      atual: ultimo.valor,
      mesAtual: ultimo.mes,
      inicio: primeiro.mes,
      multiplo: ultimo.valor / primeiro.valor,
      maiorAlta: altas.length ? Math.max(...altas.map((a) => a.ganho)) : null,
      maiorQueda: queda.queda,
    },
  };
}

export default function Pagina() {
  const dados = { BRL: montar("BRL"), USD: montar("USD") };

  return (
    <main className="pagina">
      <header className="topo">
        <p className="sobretitulo">Série histórica · 1980 – 2026</p>
        <h1>O preço do ouro, mês a mês, há 46 anos</h1>
        <p className="subtitulo">
          Todo mês desde janeiro de 1980, em dólares e em reais. Aproxime, afaste e passe o
          cursor para ler qualquer ponto. As maiores altas estão destacadas — e explicadas
          sem jargão logo abaixo do gráfico.
        </p>
      </header>

      <Painel dados={dados} parcialDesde={PARCIAL_DESDE} />

      <footer className="rodape">
        <h2>De onde vêm os números</h2>
        <ul>
          <li>
            <strong>Preço do ouro (US$ por onça troy):</strong>{" "}
            <a href={FONTES.ouro.url} target="_blank" rel="noreferrer noopener">
              {FONTES.ouro.nome}
            </a>
            . {FONTES.ouro.observacao}
          </li>
          <li>
            <strong>Dólar (R$ por US$):</strong>{" "}
            <a href={FONTES.cambio.url} target="_blank" rel="noreferrer noopener">
              {FONTES.cambio.nome}
            </a>
            . {FONTES.cambio.observacao}
          </li>
          <li>
            <strong>Preço em reais:</strong> calculado como preço em dólares × dólar médio do mesmo mês.
          </li>
        </ul>
        <p className="rodape-aviso">
          Dados até {rotuloMes(ATUALIZADO_ATE)}. Todos os valores são <strong>nominais</strong>: não foram
          corrigidos pela inflação, então comparar 1980 com 2026 diretamente exagera o ganho real.
          Este site é informativo e não é recomendação de investimento.
        </p>
        <p className="rodape-creditos">
          Código aberto em{" "}
          <a href="https://github.com/ghcastellano/precoourohistorico" target="_blank" rel="noreferrer noopener">
            github.com/ghcastellano/precoourohistorico
          </a>
        </p>
      </footer>
    </main>
  );
}
