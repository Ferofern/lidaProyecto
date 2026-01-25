
import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Customized,
} from 'recharts';
import { calculateMatch, getMatchColor } from '@/lib/csvParser';

interface DISCRadarChartProps {
  personaData: number[];
  idealData: number[];
  personName: string;
}

const discLabels = [
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)', desc: 'Directo, firme' },
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)', desc: 'Extrovertido, negociador' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)', desc: 'Sereno, paciente' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)', desc: 'Analítico, prudente' },
];

/** ✅ Texto decorativo (lo mantenemos adentro para que no se corte) */
const DecorativeLabels = () => (
  <g pointerEvents="none">
    <text x="50%" y="280" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Proactividad
    </text>

    <text
      x="90%"
      y="50%"
      textAnchor="end"
      dominantBaseline="middle"
      fontSize="12"
      fill="hsl(var(--muted-foreground))"
      fontWeight="bold"
    >
      <tspan x="93%" dy="-6">
        Tendencia a
      </tspan>
      <tspan x="93%" dy="1.2em">
        las personas
      </tspan>
    </text>

    <text x="50%" y="57%" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Receptividad
    </text>

    <text
      x="10%"
      y="50%"
      textAnchor="start"
      dominantBaseline="middle"
      fontSize="12"
      fill="hsl(var(--muted-foreground))"
      fontWeight="bold"
    >
      <tspan x="7%" dy="-6">
        Tendencia a
      </tspan>
      <tspan x="7%" dy="1.2em">
        las tareas
      </tspan>
    </text>
  </g>
);

/** ✅ Texto con contorno (SIN duplicar, se ve premium) */
const OutlinedText = ({
  x,
  y,
  textAnchor,
  fill,
  fontSize,
  fontWeight,
  children,
}: {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  fill: string;
  fontSize: number;
  fontWeight: number | string;
  children: React.ReactNode;
}) => (
  <text
    x={x}
    y={y}
    textAnchor={textAnchor}
    dominantBaseline="middle"
    fill={fill}
    fontSize={fontSize}
    fontWeight={fontWeight}
    stroke="white"
    strokeWidth={3}
    paintOrder="stroke fill"
    strokeLinejoin="round"
  >
    {children}
  </text>
);

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const data = discLabels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);

    const rawDiff0 = p - i;
    const rawDiff = Math.abs(rawDiff0) < 0.05 ? 0 : rawDiff0; // evita -0.0

    const diffColor = rawDiff >= 0 ? '#16a34a' : '#ef4444';

    return {
      subject: label.key,
      fullName: label.name,
      description: label.desc,
      persona: p,
      ideal: i,
      diff: rawDiff,
      diffColor,
      diffLabelOuter: Math.abs(rawDiff).toFixed(0),
      diffLabelTooltip: `${rawDiff >= 0 ? '+' : ''}${rawDiff.toFixed(1)}`,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">DISC</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match:</span>
          <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
        </div>
      </div>

      {/* ✅ Más alto + radar más grande */}
      <div className="relative w-full h-[520px] md:h-[560px] overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            cx="50%"
            cy="50%"
            // ✅ más grande que antes
            outerRadius="72%"
            startAngle={140}
            endAngle={-220}
            // ✅ menos margen para que el radar ocupe más
            margin={{ top: 36, right: 70, bottom: 36, left: 70 }}
          >
            <PolarGrid stroke="hsl(var(--border))" gridType="circle" />

            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload }) => {
                const key = payload?.value as string;
                const label = discLabels.find((l) => l.key === key);
                const item = data.find((d) => d.subject === key);

                // ✅ Más cerca para que no empuje tanto a los bordes (pero sin montarse)
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                let dx = 0;
                let dy = 0;

                if (key === 'D') { textAnchor = 'end'; dx = -14; dy = -12; }
                if (key === 'I') { textAnchor = 'start'; dx = 14; dy = -12; }
                if (key === 'S') { textAnchor = 'start'; dx = 14; dy = 24; }
                if (key === 'C') { textAnchor = 'end'; dx = -14; dy = 24; }

                const nameY = dy;
                const descY = dy + 14;
                const numY = dy + 40;

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={dx}
                      y={nameY}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      fill={label?.color}
                      fontSize={14}   // un pelín menor para estética
                      fontWeight="800"
                    >
                      {label?.name}
                    </text>

                    <text
                      x={dx}
                      y={descY}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={10}
                      fontWeight="600"
                    >
                      {label?.desc}
                    </text>

                    {item?.diffLabelOuter != null && (
                      <OutlinedText
                        x={dx}
                        y={numY}
                        textAnchor={textAnchor}
                        fill={item.diffColor}
                        fontSize={18}
                        fontWeight={900}
                      >
                        {item.diffLabelOuter}
                      </OutlinedText>
                    )}
                  </g>
                );
              }}
            />

            <Radar
              name="Perfil Ideal"
              dataKey="ideal"
              stroke="hsl(var(--chart-ideal))"
              fill="hsl(var(--chart-ideal))"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={false}
            />

            <Radar
              name={personName}
              dataKey="persona"
              stroke="hsl(var(--chart-person))"
              fill="hsl(var(--chart-person))"
              fillOpacity={0.28}
              strokeWidth={2}
              dot={false}
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload;
                const color = discLabels.find((l) => l.key === item.subject)?.color;

                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold" style={{ color }}>
                      {item.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>

                    <p className="text-sm">
                      Ideal: <span className="font-medium text-primary">{item.ideal}</span>
                    </p>
                    <p className="text-sm">
                      {personName}: <span className="font-medium text-secondary">{item.persona}</span>
                    </p>

                    <p className="text-sm">
                      Diferencia:{' '}
                      <span className="font-bold" style={{ color: item.diffColor }}>
                        {item.diffLabelTooltip}
                      </span>
                    </p>
                  </div>
                );
              }}
            />

            <Customized component={DecorativeLabels} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
