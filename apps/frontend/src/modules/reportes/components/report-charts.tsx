import { money } from "@/lib/format";

/**
 * Graficos SVG del modulo de reportes, sin dependencias. Paletas validadas con
 * el validador de dataviz (banda de luminosidad, croma, separacion CVD, contraste).
 */

export const FLOW_COLORS = { income: "#2563eb", outflow: "#dc2626" } as const;

/** Color fijo por metodo de pago: el color sigue a la entidad, nunca al orden. */
export const METHOD_COLORS: Record<string, string> = {
  CASH: "#2563eb",
  TRANSFER: "#059669",
  PLIN: "#0891b2",
  YAPE: "#d97706",
  CARD: "#7c3aed",
  OTHER: "#db2777"
};

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const width = 64;
  const height = 22;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * width},${height - 2 - ((value - min) / span) * (height - 4)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-6 w-16 shrink-0" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type FlowPoint = { label: string; income: number; outflow: number };

export function FlowChart({ points }: { points: FlowPoint[] }) {
  const width = 720;
  const height = 240;
  const pad = { top: 18, right: 24, bottom: 28, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.outflow])) * 1.15;

  const x = (index: number) => pad.left + (points.length > 1 ? (index / (points.length - 1)) * innerW : innerW / 2);
  const y = (value: number) => pad.top + innerH - (value / max) * innerH;
  const path = (key: "income" | "outflow") => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p[key])}`).join(" ");
  const area = `${path("income")} L${x(points.length - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round((max * t) / 10) * 10);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Flujo financiero: ingresos y egresos por mes">
      {/* rejilla recesiva + eje Y */}
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={pad.left - 8} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{`S/ ${Intl.NumberFormat("es-PE").format(tick)}`}</text>
        </g>
      ))}
      <path d={area} fill={FLOW_COLORS.income} opacity="0.08" />
      <path d={path("income")} fill="none" stroke={FLOW_COLORS.income} strokeWidth="2" strokeLinejoin="round" />
      <path d={path("outflow")} fill="none" stroke={FLOW_COLORS.outflow} strokeWidth="2" strokeLinejoin="round" />
      {points.map((point, index) => (
        <g key={point.label}>
          {/* puntos con anillo de superficie y tooltip nativo */}
          <circle cx={x(index)} cy={y(point.income)} r="4" fill={FLOW_COLORS.income} stroke="#ffffff" strokeWidth="2">
            <title>{`${point.label} · Ingresos: ${money(point.income)}`}</title>
          </circle>
          <circle cx={x(index)} cy={y(point.outflow)} r="4" fill={FLOW_COLORS.outflow} stroke="#ffffff" strokeWidth="2">
            <title>{`${point.label} · Egresos: ${money(point.outflow)}`}</title>
          </circle>
          {index === points.length - 1 || point.income === Math.max(...points.map((p) => p.income)) ? (
            <text x={x(index)} y={y(point.income) - 9} textAnchor="middle" fontSize="10" fill="#475569">{money(point.income)}</text>
          ) : null}
          <text x={x(index)} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">{point.label}</text>
        </g>
      ))}
    </svg>
  );
}

type DonutSegment = { label: string; amount: number; color: string };

export function DonutChart({ segments, centerLabel, centerValue }: { segments: DonutSegment[]; centerLabel: string; centerValue: string }) {
  const size = 132;
  const radius = 50;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  const gap = segments.length > 1 ? 2.5 : 0;

  let offset = -90;
  const arcs = segments.map((segment) => {
    const fraction = total > 0 ? segment.amount / total : 0;
    const arcLength = Math.max(fraction * circumference - gap, 0);
    const arc = { ...segment, dash: `${arcLength} ${circumference - arcLength}`, rotate: offset };
    offset += fraction * 360;
    return arc;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-32 w-32 shrink-0" role="img" aria-label={centerLabel}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={arc.dash}
          strokeLinecap="butt"
          transform={`rotate(${arc.rotate} ${size / 2} ${size / 2})`}
        >
          <title>{`${arc.label}: ${money(arc.amount)}`}</title>
        </circle>
      ))}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="10" fill="#64748b">{centerLabel}</text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{centerValue}</text>
    </svg>
  );
}
