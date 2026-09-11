# precoourohistorico

Preço histórico do ouro, mês a mês, de **janeiro de 1980 a setembro de 2026**, em dólares e em reais —
com zoom livre, os ciclos de alta destacados automaticamente e leituras em linguagem simples.

**Produção:** https://precoourohistorico.vercel.app

## Como funciona

| Camada | O quê |
|---|---|
| `data/*.json` | Séries mensais congeladas no repositório. Sem chamada de API em tempo de execução: o site abre instantâneo e não quebra se uma fonte sair do ar. |
| `lib/series.ts` | Monta as séries. Ouro em reais = ouro em dólares × dólar médio do mesmo mês. |
| `lib/rallies.ts` | Detecção de ciclos de alta por **ZigZag**, 100% derivada dos dados. |
| `lib/eras.ts` | Tabela de contexto histórico — empresta apenas **título e explicação** aos ciclos detectados. |
| `lib/insights.ts` | Todos os textos de insight são calculados a partir da série, não escritos à mão. |
| `components/Chart.tsx` | Gráfico em SVG, sem biblioteca externa: roda do mouse, arrasto, pinça, teclado e escala log. |

### Detecção dos ciclos de alta

Um ciclo é registrado quando o preço sobe do fundo ao topo **≥ 60%**, durante **≥ 12 meses**, e só é
encerrado depois de recuar **15%** a partir do topo. As três maiores altas de cada moeda recebem cor
própria (paleta validada para daltonismo em todos os pares); as demais ficam em tom neutro.

## Fontes

- **Ouro (US$/onça troy):** [World Bank Commodity Markets (Pink Sheet)](https://github.com/datasets/gold-prices) — série de 1960 em diante, a partir do fixing de Londres (LBMA). Licença ODC-PDDL-1.0.
- **Dólar (R$/US$):** [Banco Central do Brasil — SGS série 3698](https://api.bcb.gov.br/dados/serie/bcdata.sgs.3698/dados?formato=json), média mensal da taxa de câmbio livre (venda).

Setembro de 2026 é um mês em curso: o ouro usa o spot de 11/09/2026 e o dólar, a média do PTAX de 01 a 10/09.

### Por que a série em reais começa em 1994

O Real só existe desde **julho de 1994**. Os anos anteriores foram de cruzeiro, cruzado, cruzado novo e
cruzeiro real, sob hiperinflação — encadear aquelas moedas produziria "reais equivalentes" sem
significado prático. A série em dólares cobre 1980 em diante sem essa ressalva.

## Rodando local

```bash
npm install
npm run dev
```

## Aviso

Todos os valores são **nominais**, sem correção pela inflação. Conteúdo informativo; não é
recomendação de investimento.
