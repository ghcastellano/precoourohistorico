"use client";

import { useState } from "react";
import { moeda as fmtMoeda, pct, rotuloMes } from "@/lib/format";
import type { Alta, Moeda, Ponto } from "@/lib/types";

/** Equivalente acessível do gráfico: todo valor plotado também é legível como texto. */
export default function Tabela({ pontos, altas, moeda }: { pontos: Ponto[]; altas: Alta[]; moeda: Moeda }) {
  const [tudo, setTudo] = useState(false);
  const comIndice = pontos.map((p, i) => ({ ...p, i })).reverse();
  const linhas = tudo ? comIndice : comIndice.slice(0, 36);

  const nome = (i: number) => altas.find((r) => i >= r.i0 && i <= r.i1)?.era.titulo ?? "—";

  return (
    <div className="tabela-envolve">
      <table className="tabela">
        <caption className="sr-only">Preço do ouro por onça troy, mês a mês, em {moeda}</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Preço por onça</th>
            <th scope="col">Variação no mês</th>
            <th scope="col">Ciclo de alta</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ i, ...p }) => {
            const anterior = i > 0 ? pontos[i - 1].valor : null;
            const var_ = anterior ? p.valor / anterior - 1 : null;
            return (
              <tr key={p.mes}>
                <th scope="row">{rotuloMes(p.mes)}</th>
                <td>{fmtMoeda(p.valor, moeda)}</td>
                <td className={var_ !== null && var_ < 0 ? "neg" : "pos"}>
                  {var_ === null ? "—" : pct(var_, 1)}
                </td>
                <td>{nome(i)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!tudo && (
        <button type="button" className="chip" onClick={() => setTudo(true)}>
          Mostrar todos os {pontos.length} meses
        </button>
      )}
    </div>
  );
}
