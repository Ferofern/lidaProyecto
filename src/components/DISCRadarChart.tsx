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

/** ✅ Textos decorativos ajustados para altura reducida */
const DecorativeLabels = () => (
  <g pointerEvents="none">
    {/* Proactividad pegado arriba */}
    <text x="50%" y="20" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Proactividad
    </text>

    {/* Lado derecho */}
    <text
      x="95%"
      y="50%"
      textAnchor="end"
      dominantBaseline="middle"
      fontSize="11"
      fill="hsl(var(--muted-foreground))"
      fontWeight="bold"
    >
      <tspan x="98%" dy="-6">Tendencia a</tspan>
      <tspan x="98%" dy="1.2em">las personas</tspan>
    </text>

    {/* Receptividad pegado abajo */}
    <text x="50%" y="96%" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Receptividad
    </text>

    {/* Lado izquierdo */}
    <text
      x="5%"
      y="50%"
      textAnchor="start"
      dominantBaseline="middle"
      fontSize="11"
      fill="hsl(var(--muted-foreground))"
      fontWeight="bold"
    >
      <tspan x="2%" dy="-6">Tendencia a</tspan>
      <tspan x="2%" dy="1.2em">las tareas</tspan>
    </text>
  </g>
);

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
    const rawDiff = Math.abs(rawDiff0) < 0.05 ? 0 : rawDiff0;
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-semibold text-foreground">DISC</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match:</span>
          <span className={`text-base font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
        </div>
      </div>

      {/* ✅ ALTURA REDUCIDA: h-[340px] en móvil, h-[380px] en desktop */}
      <div className="relative w-full h-[340px] md:h-[380px] overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%" 
            startAngle={140}
            endAngle={-220}
            // ✅ Márgenes mínimos para aprovechar el espacio vertical
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid stroke="hsl(var(--border))" gridType="circle" />

            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload }) => {
                const key = payload?.value as string;
                const label = discLabels.find((l) => l.key === key);
                const item = data.find((d) => d.subject === key);

                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                let dx = 0;
                let dy = 0;

                // ✅ Ajustes más apretados para la nueva altura
                if (key === 'D') { textAnchor = 'end'; dx = -10; dy = -5; }
                if (key === 'I') { textAnchor = 'start'; dx = 10; dy = -5; }
                if (key === 'S') { textAnchor = 'start'; dx = 10; dy = 15; }
                if (key === 'C') { textAnchor = 'end'; dx = -10; dy = 15; }

                const nameY = dy;
                const descY = dy + 12; // Menos espacio entre líneas
                const numY = dy + 32;  // Número más cerca

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={dx}
                      y={nameY}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      fill={label?.color}
                      fontSize={13} 
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
                        fontSize={16}
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
                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-bold" style={{ color }}>{item.fullName}</p>
                    <p className="text-[10px] text-muted-foreground mb-1">{item.description}</p>
                    <div className="flex justify-between gap-4">
                      <span>Ideal: <b className="text-primary">{item.ideal}</b></span>
                      <span>{personName}: <b className="text-secondary">{item.persona}</b></span>
                    </div>
                    <p className="mt-1">
                      Dif: <b style={{ color: item.diffColor }}>{item.diffLabelTooltip}</b>
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