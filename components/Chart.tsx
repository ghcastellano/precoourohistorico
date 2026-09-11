"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as EventoTeclado, PointerEvent as EventoPonteiro } from "react";
import { anoDe, eixoY, moeda as fmtMoeda, pct, rotuloMes } from "@/lib/format";
import type { Alta, Moeda, Ponto } from "@/lib/types";

const MARGEM = { topo: 16, direita: 16, baixo: 30, esquerda: 64 };
const MIN_MESES = 8;

/** Cores das altas. Trio validado para daltonismo em todos os pares. */
export const COR_ALTA = ["#3987e5", "#d95926", "#199e70"] as const;
export const COR_ALTA_MENOR = "#7d776a";

export function corDaAlta(rank: number): string {
  return rank < COR_ALTA.length ? COR_ALTA[rank] : COR_ALTA_MENOR;
}

type Props = {
  pontos: Ponto[];
  altas: Alta[];
  moeda: Moeda;
  parcialDesde: string | null;
};

type Janela = { a: number; b: number };

export default function Chart({ pontos, altas, moeda, parcialDesde }: Props) {
  const n = pontos.length;
  const total = useMemo<Janela>(() => ({ a: 0, b: n - 1 }), [n]);
  const [janela, setJanela] = useState<Janela>(total);
  const [log, setLog] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const envolveRef = useRef<HTMLDivElement | null>(null);
  const [caixa, setCaixa] = useState({ largura: 900, altura: 420 });

  useEffect(() => setJanela({ a: 0, b: n - 1 }), [n]);

  useEffect(() => {
    const el = envolveRef.current;
    if (!el) return;
    const medir = () => {
      const largura = el.clientWidth;
      const altura = Math.max(300, Math.min(520, Math.round(largura * 0.46)));
      setCaixa({ largura, altura });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const larguraPlot = Math.max(10, caixa.largura - MARGEM.esquerda - MARGEM.direita);
  const alturaPlot = Math.max(10, caixa.altura - MARGEM.topo - MARGEM.baixo);

  const limitar = useCallback(
    (j: Janela): Janela => {
      let { a, b } = j;
      if (b - a < MIN_MESES) {
        const meio = (a + b) / 2;
        a = meio - MIN_MESES / 2;
        b = meio + MIN_MESES / 2;
      }
      if (b - a > n - 1) return { a: 0, b: n - 1 };
      if (a < 0) { b -= a; a = 0; }
      if (b > n - 1) { a -= b - (n - 1); b = n - 1; }
      return { a: Math.max(0, a), b: Math.min(n - 1, b) };
    },
    [n],
  );

  const zoom = useCallback(
    (fator: number, ancora = 0.5) => {
      setJanela((j) => {
        const span = j.b - j.a;
        const novo = span * fator;
        const centro = j.a + span * ancora;
        return limitar({ a: centro - novo * ancora, b: centro + novo * (1 - ancora) });
      });
    },
    [limitar],
  );

  // Roda do mouse: precisa de listener não-passivo para bloquear o scroll da página.
  useEffect(() => {
    const el = envolveRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.deltaY) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const ancora = Math.min(1, Math.max(0, (e.clientX - r.left - MARGEM.esquerda) / larguraPlot));
      zoom(e.deltaY > 0 ? 1.18 : 1 / 1.18, ancora);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, larguraPlot]);

  // Arrastar para deslocar e pinça de dois dedos para ampliar.
  const ponteiros = useRef(new Map<number, number>());
  const arraste = useRef<{ x: number; j: Janela } | null>(null);
  const pinca = useRef<{ dist: number; j: Janela } | null>(null);

  const aoDescer = (e: EventoPonteiro) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    ponteiros.current.set(e.pointerId, e.clientX);
    if (ponteiros.current.size === 1) arraste.current = { x: e.clientX, j: janela };
    if (ponteiros.current.size === 2) {
      const [p, q] = [...ponteiros.current.values()];
      pinca.current = { dist: Math.abs(p - q) || 1, j: janela };
      arraste.current = null;
    }
  };

  const aoMover = (e: EventoPonteiro) => {
    const el = envolveRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    if (ponteiros.current.has(e.pointerId)) ponteiros.current.set(e.pointerId, e.clientX);

    if (pinca.current && ponteiros.current.size === 2) {
      const [p, q] = [...ponteiros.current.values()];
      const d = Math.abs(p - q) || 1;
      const base = pinca.current.j;
      const span = (base.b - base.a) * (pinca.current.dist / d);
      const centro = (base.a + base.b) / 2;
      setJanela(limitar({ a: centro - span / 2, b: centro + span / 2 }));
      return;
    }

    if (arraste.current) {
      const span = arraste.current.j.b - arraste.current.j.a;
      const delta = ((arraste.current.x - e.clientX) / larguraPlot) * span;
      setJanela(limitar({ a: arraste.current.j.a + delta, b: arraste.current.j.b + delta }));
      return;
    }

    const px = e.clientX - r.left - MARGEM.esquerda;
    if (px < -12 || px > larguraPlot + 12) { setHover(null); return; }
    const t = Math.min(1, Math.max(0, px / larguraPlot));
    setHover(Math.round(janela.a + t * (janela.b - janela.a)));
  };

  const aoSubir = (e: EventoPonteiro) => {
    ponteiros.current.delete(e.pointerId);
    if (ponteiros.current.size < 2) pinca.current = null;
    if (ponteiros.current.size === 0) arraste.current = null;
  };

  const aoSair = () => {
    setHover(null);
    ponteiros.current.clear();
    pinca.current = null;
    arraste.current = null;
  };

  const aoTeclar = (e: EventoTeclado) => {
    const span = janela.b - janela.a;
    const passo = Math.max(1, Math.round(span * 0.12));
    if (e.key === "ArrowRight") { setJanela(limitar({ a: janela.a + passo, b: janela.b + passo })); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { setJanela(limitar({ a: janela.a - passo, b: janela.b - passo })); e.preventDefault(); }
    else if (e.key === "+" || e.key === "=") { zoom(1 / 1.3); e.preventDefault(); }
    else if (e.key === "-" || e.key === "_") { zoom(1.3); e.preventDefault(); }
    else if (e.key === "Home") { setJanela(total); e.preventDefault(); }
  };

  // ----- escalas -----
  const iA = Math.max(0, Math.floor(janela.a));
  const iB = Math.min(n - 1, Math.ceil(janela.b));
  const visiveis = pontos.slice(iA, iB + 1);
  const vMin = Math.min(...visiveis.map((p) => p.valor));
  const vMax = Math.max(...visiveis.map((p) => p.valor));

  const [y0, y1] = useMemo(() => {
    if (log) {
      const lo = Math.log10(vMin), hi = Math.log10(vMax);
      const folga = (hi - lo || 0.1) * 0.08;
      return [Math.pow(10, lo - folga), Math.pow(10, hi + folga)];
    }
    const folga = (vMax - vMin || vMax * 0.1) * 0.10;
    return [Math.max(0, vMin - folga), vMax + folga];
  }, [vMin, vMax, log]);

  const x = useCallback(
    (i: number) => MARGEM.esquerda + ((i - janela.a) / (janela.b - janela.a)) * larguraPlot,
    [janela, larguraPlot],
  );
  const y = useCallback(
    (v: number) => {
      const t = log
        ? (Math.log10(v) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0))
        : (v - y0) / (y1 - y0);
      return MARGEM.topo + (1 - t) * alturaPlot;
    },
    [y0, y1, log, alturaPlot],
  );

  const ticksY = useMemo(() => marcasY(y0, y1, log, alturaPlot), [y0, y1, log, alturaPlot]);
  const ticksX = useMemo(() => marcasX(pontos, iA, iB, larguraPlot), [pontos, iA, iB, larguraPlot]);

  const caminho = useCallback(
    (de: number, ate: number) => {
      let d = "";
      for (let i = Math.max(0, de); i <= Math.min(n - 1, ate); i++) {
        d += `${d ? "L" : "M"}${x(i).toFixed(2)} ${y(pontos[i].valor).toFixed(2)}`;
      }
      return d;
    },
    [x, y, pontos, n],
  );

  const altasVisiveis = altas.filter((r) => r.i1 >= iA && r.i0 <= iB);
  const hoverPt = hover !== null && hover >= 0 && hover < n ? pontos[hover] : null;
  const altaNoHover = hover === null ? null : altas.find((r) => hover >= r.i0 && hover <= r.i1) ?? null;
  const parcial = parcialDesde ? pontos.findIndex((p) => p.mes === parcialDesde) : -1;

  const span = Math.round(janela.b - janela.a);
  const podeAmpliar = span > MIN_MESES;
  const podeAfastar = span < n - 1;

  return (
    <div className="grafico">
      <div className="grafico-barra">
        <div className="presets" role="group" aria-label="Período do gráfico">
          {[
            { r: "Tudo", m: n - 1 },
            { r: "20 anos", m: 240 },
            { r: "10 anos", m: 120 },
            { r: "5 anos", m: 60 },
            { r: "1 ano", m: 12 },
          ]
            .filter((p) => p.m <= n - 1)
            .map((p) => (
              <button
                key={p.r}
                type="button"
                className={`chip ${span === p.m ? "chip--ativo" : ""}`}
                aria-pressed={span === p.m}
                onClick={() => setJanela(limitar({ a: n - 1 - p.m, b: n - 1 }))}
              >
                {p.r}
              </button>
            ))}
        </div>
        <div className="zoom-controles">
          <button type="button" className="botao-icone" onClick={() => zoom(1.4)} disabled={!podeAfastar} aria-label="Afastar (zoom out)" title="Afastar">−</button>
          <button type="button" className="botao-icone" onClick={() => zoom(1 / 1.4)} disabled={!podeAmpliar} aria-label="Aproximar (zoom in)" title="Aproximar">+</button>
          <button type="button" className="chip" onClick={() => setJanela(total)}>Reiniciar</button>
          <button type="button" className={`chip ${log ? "chip--ativo" : ""}`} aria-pressed={log} onClick={() => setLog((v) => !v)} title="Escala logarítmica: aproxima visualmente altas antigas e recentes">
            Escala log
          </button>
        </div>
      </div>

      <div
        ref={envolveRef}
        className="grafico-area"
        tabIndex={0}
        role="application"
        aria-label={`Preço do ouro de ${rotuloMes(pontos[iA].mes)} a ${rotuloMes(pontos[iB].mes)}. Use as setas para deslocar e as teclas mais e menos para ampliar.`}
        onKeyDown={aoTeclar}
        onPointerDown={aoDescer}
        onPointerMove={aoMover}
        onPointerUp={aoSubir}
        onPointerCancel={aoSubir}
        onPointerLeave={aoSair}
      >
        <svg width={caixa.largura} height={caixa.altura} role="img">
          <defs>
            <clipPath id="area-plot">
              <rect x={MARGEM.esquerda} y={MARGEM.topo} width={larguraPlot} height={alturaPlot} />
            </clipPath>
          </defs>

          {ticksY.map((t) => (
            <g key={`gy-${t}`}>
              <line x1={MARGEM.esquerda} x2={MARGEM.esquerda + larguraPlot} y1={y(t)} y2={y(t)} className="grade" />
              <text x={MARGEM.esquerda - 10} y={y(t)} dy="0.32em" textAnchor="end" className="rotulo-eixo">
                {eixoY(t, moeda)}
              </text>
            </g>
          ))}

          <g clipPath="url(#area-plot)">
            {altasVisiveis.map((r) => (
              <rect
                key={`faixa-${r.i0}`}
                x={x(r.i0)}
                y={MARGEM.topo}
                width={Math.max(1, x(r.i1) - x(r.i0))}
                height={alturaPlot}
                fill={corDaAlta(r.rank)}
                opacity={r.rank < 3 ? 0.13 : 0.07}
              />
            ))}
            {altasVisiveis.map((r) => (
              <line
                key={`borda-${r.i0}`}
                x1={x(r.i0)} x2={x(r.i0)}
                y1={MARGEM.topo} y2={MARGEM.topo + alturaPlot}
                stroke={corDaAlta(r.rank)} strokeWidth={1} opacity={0.5}
              />
            ))}

            <path d={caminho(iA - 1, iB + 1)} className="linha-base" />

            {altasVisiveis.map((r) => (
              <path
                key={`linha-${r.i0}`}
                d={caminho(r.i0, r.i1)}
                fill="none"
                stroke={corDaAlta(r.rank)}
                strokeWidth={r.rank < 3 ? 2.6 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {altasVisiveis.filter((r) => r.rank < 3 && x(r.i1) - x(r.i0) > 90).map((r) => (
              <text
                key={`marca-${r.i0}`}
                x={(x(r.i0) + x(r.i1)) / 2}
                y={MARGEM.topo + 16}
                textAnchor="middle"
                className="marca-alta"
                fill={corDaAlta(r.rank)}
              >
                {pct(r.ganho)}
              </text>
            ))}

            {parcial >= 0 && parcial >= iA - 1 && parcial <= iB + 1 && (
              <circle cx={x(parcial)} cy={y(pontos[parcial].valor)} r={3.5} className="ponto-parcial" />
            )}

            {hoverPt && (
              <>
                <line x1={x(hover!)} x2={x(hover!)} y1={MARGEM.topo} y2={MARGEM.topo + alturaPlot} className="cursor-linha" />
                <circle cx={x(hover!)} cy={y(hoverPt.valor)} r={5} className="cursor-ponto" style={{ fill: altaNoHover ? corDaAlta(altaNoHover.rank) : undefined }} />
              </>
            )}
          </g>

          <line x1={MARGEM.esquerda} x2={MARGEM.esquerda + larguraPlot} y1={MARGEM.topo + alturaPlot} y2={MARGEM.topo + alturaPlot} className="eixo" />
          {ticksX.map((t) => (
            <text key={`tx-${t.i}`} x={x(t.i)} y={caixa.altura - 10} textAnchor="middle" className="rotulo-eixo">
              {t.rotulo}
            </text>
          ))}
        </svg>

        {hoverPt && (
          <div
            className="dica"
            style={{
              left: Math.min(Math.max(x(hover!) + 14, 8), caixa.largura - 236),
              top: Math.min(Math.max(y(hoverPt.valor) - 12, 8), caixa.altura - 120),
            }}
          >
            <div className="dica-mes">{rotuloMes(hoverPt.mes)}</div>
            <div className="dica-valor">{fmtMoeda(hoverPt.valor, moeda)}</div>
            <div className="dica-unidade">por onça troy</div>
            {altaNoHover && (
              <div className="dica-alta" style={{ borderColor: corDaAlta(altaNoHover.rank) }}>
                <span className="ponto-cor" style={{ background: corDaAlta(altaNoHover.rank) }} aria-hidden="true" />
                {altaNoHover.era.titulo} · {pct(altaNoHover.ganho)}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="grafico-ajuda">
        Role a roda do mouse (ou use dois dedos) sobre o gráfico para aproximar e afastar; arraste para andar no tempo.
        Com o teclado: setas deslocam, <kbd>+</kbd> e <kbd>−</kbd> dão zoom.
      </p>
    </div>
  );
}

/** Marcas "redondas" no eixo de valores. */
function marcasY(y0: number, y1: number, log: boolean, altura: number): number[] {
  const alvo = Math.max(3, Math.min(7, Math.round(altura / 70)));
  if (log) {
    const out: number[] = [];
    for (let e = Math.floor(Math.log10(y0)); e <= Math.ceil(Math.log10(y1)); e++) {
      for (const m of [1, 2, 5]) {
        const v = m * Math.pow(10, e);
        if (v >= y0 && v <= y1) out.push(v);
      }
    }
    return out.length >= 2 ? out : [y0, y1];
  }
  const bruto = (y1 - y0) / alvo;
  const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
  const norm = bruto / mag;
  const passo = (norm >= 5 ? 5 : norm >= 2 ? 2 : norm >= 1 ? 1 : 0.5) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(y0 / passo) * passo; v <= y1; v += passo) out.push(Number(v.toFixed(6)));
  return out;
}

/** Anos "redondos" no eixo do tempo, com densidade adaptada ao zoom. */
function marcasX(pontos: Ponto[], iA: number, iB: number, largura: number) {
  const anosVisiveis = (iB - iA) / 12;
  const alvo = Math.max(3, Math.min(9, Math.floor(largura / 90)));
  const passos = [1, 2, 5, 10, 20, 25, 50];
  const passo = passos.find((p) => anosVisiveis / p <= alvo) ?? 50;
  const out: { i: number; rotulo: string }[] = [];

  if (anosVisiveis <= 2.2) {
    const denso = Math.max(1, Math.round((iB - iA) / alvo));
    for (let i = iA; i <= iB; i += denso) out.push({ i, rotulo: rotuloMes(pontos[i].mes) });
    return out;
  }
  for (let i = iA; i <= iB; i++) {
    const mes = pontos[i].mes;
    if (mes.endsWith("-01") && anoDe(mes) % passo === 0) out.push({ i, rotulo: mes.slice(0, 4) });
  }
  return out.length ? out : [{ i: iA, rotulo: pontos[iA].mes.slice(0, 4) }];
}
