"use client";

import { useState } from "react";
import Chart, { corDaAlta } from "./Chart";
import Tabela from "./Tabela";
import { duracao, mesPorExtenso, moeda as fmtMoeda, pct, rotuloMes, vezes } from "@/lib/format";
import type { Alta, Moeda, Ponto } from "@/lib/types";
import type { Insight } from "@/lib/insights";

export type DadosMoeda = {
  pontos: Ponto[];
  altas: Alta[];
  insights: Insight[];
  resumo: {
    atual: number;
    mesAtual: string;
    inicio: string;
    multiplo: number;
    maiorAlta: number | null;
    maiorQueda: number;
  };
};

type Props = {
  dados: Record<Moeda, DadosMoeda>;
  parcialDesde: string | null;
};

const ROTULO: Record<Moeda, string> = { BRL: "Reais (R$)", USD: "Dólares (US$)" };

export default function Painel({ dados, parcialDesde }: Props) {
  const [moeda, setMoeda] = useState<Moeda>("BRL");
  const [tabela, setTabela] = useState(false);
  const d = dados[moeda];

  return (
    <>
      <div className="filtros" role="group" aria-label="Moeda do gráfico">
        <span className="filtros-rotulo">Mostrar preços em</span>
        <div className="segmentado">
          {(["BRL", "USD"] as Moeda[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`segmento ${moeda === m ? "segmento--ativo" : ""}`}
              aria-pressed={moeda === m}
              onClick={() => setMoeda(m)}
            >
              {ROTULO[m]}
            </button>
          ))}
        </div>
      </div>

      {moeda === "BRL" && (
        <p className="aviso">
          A série em reais começa em <strong>julho de 1994</strong>, quando o Real passou a existir.
          Antes disso o país usou cruzeiro, cruzado, cruzado novo e cruzeiro real, com hiperinflação —
          converter aqueles preços para “reais de hoje” produziria números sem significado.
          Para ver 1980 em diante, troque para dólares.
        </p>
      )}

      <section className="tiles" aria-label="Números principais">
        <div className="tile tile--destaque">
          <span className="tile-rotulo">Preço agora · {rotuloMes(d.resumo.mesAtual)}</span>
          <strong className="tile-valor">{fmtMoeda(d.resumo.atual, moeda)}</strong>
          <span className="tile-nota">por onça troy (31,1 g)</span>
        </div>
        <div className="tile">
          <span className="tile-rotulo">Desde {rotuloMes(d.resumo.inicio)}</span>
          <strong className="tile-valor">{vezes(d.resumo.multiplo)}</strong>
          <span className="tile-nota">em valores nominais</span>
        </div>
        <div className="tile">
          <span className="tile-rotulo">Maior alta do período</span>
          <strong className="tile-valor" style={{ color: corDaAlta(0) }}>
            {d.resumo.maiorAlta !== null ? pct(d.resumo.maiorAlta) : "—"}
          </strong>
          <span className="tile-nota">do fundo ao topo</span>
        </div>
        <div className="tile">
          <span className="tile-rotulo">Maior queda do período</span>
          <strong className="tile-valor tile-valor--queda">{pct(d.resumo.maiorQueda)}</strong>
          <span className="tile-nota">do topo ao fundo</span>
        </div>
      </section>

      <section className="cartao" aria-label="Gráfico do preço do ouro">
        <header className="cartao-cabecalho">
          <h2>Preço do ouro por onça, mês a mês — em {moeda === "BRL" ? "reais" : "dólares"}</h2>
          <p>
            A linha clara é o preço. Os trechos coloridos são os ciclos de alta que o próprio
            cálculo encontrou nos dados — as três maiores ganham cor própria.
          </p>
        </header>

        <Chart pontos={d.pontos} altas={d.altas} moeda={moeda} parcialDesde={parcialDesde} />

        <Legenda altas={d.altas} moeda={moeda} />

        <div className="cartao-rodape">
          <button type="button" className="chip" aria-expanded={tabela} onClick={() => setTabela((v) => !v)}>
            {tabela ? "Ocultar tabela de dados" : "Ver tabela de dados"}
          </button>
        </div>
        {tabela && <Tabela pontos={d.pontos} altas={d.altas} moeda={moeda} />}
      </section>

      <section className="insights" aria-label="O que esses números querem dizer">
        <h2>O que esses números querem dizer</h2>
        <p className="insights-intro">
          Sem jargão: seis leituras que qualquer pessoa consegue acompanhar.
        </p>
        <div className="insights-lista">
          {d.insights.map((i) => (
            <article key={i.titulo} className="insight">
              <h3>{i.titulo}</h3>
              {i.destaque && <p className="insight-destaque">{i.destaque}</p>}
              <p className="insight-texto">{i.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Legenda({ altas, moeda }: { altas: Alta[]; moeda: Moeda }) {
  const ordenadas = [...altas].sort((a, b) => a.i0 - b.i0);
  return (
    <div className="legenda">
      <h3 className="legenda-titulo">Os ciclos de alta encontrados nos dados</h3>
      <ul className="legenda-lista">
        {ordenadas.map((r) => (
          <li key={r.i0} className={`legenda-item ${r.rank < 3 ? "legenda-item--maior" : ""}`}>
            <span className="ponto-cor" style={{ background: corDaAlta(r.rank) }} aria-hidden="true" />
            <div>
              <p className="legenda-cabeca">
                <strong>{r.era.titulo}</strong>
                <span className="legenda-ganho" style={{ color: corDaAlta(r.rank) }}>{pct(r.ganho)}</span>
              </p>
              <p className="legenda-periodo">
                {rotuloMes(r.mes0)} → {rotuloMes(r.mes1)} · {duracao(r.meses)} ·{" "}
                {fmtMoeda(r.valor0, moeda)} → {fmtMoeda(r.valor1, moeda)}
              </p>
              {r.rank < 3 && <p className="legenda-explicacao">{r.era.explicacao}</p>}
            </div>
          </li>
        ))}
      </ul>
      <p className="legenda-nota">
        Um ciclo é marcado quando o preço sobe do fundo ao topo pelo menos 60%, por 12 meses ou mais, e
        só é encerrado depois de cair 15% a partir do topo. Nenhuma data foi escolhida a dedo — os títulos
        históricos são apenas o nome do que estava acontecendo. Detalhe honesto: em {mesPorExtenso("2026-09")} o
        ciclo mais recente ainda pode não ter terminado.
      </p>
    </div>
  );
}
