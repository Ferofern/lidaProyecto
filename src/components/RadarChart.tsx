
import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { calculateMatch, getMatchColor } from '@/lib/csvParser';

interface RadarChartProps {
  title: string;
  labels: string[];
  personaData: number[];
  idealData: number[];
  personName: string;
}

const velnaColors: Record<string, string> = {
  Verbal: 'hsl(280, 70%, 50%)',
  Espacial: 'hsl(200, 80%, 50%)',
  Lógico: 'hsl(35, 90%, 50%)',
  Numérico: 'hsl(150, 70%, 40%)',
  Abstracto: 'hsl(340, 75%, 55%)',
};

const competenciaColors = [
  'hsl(220, 80%, 55%)',
  'hsl(160, 70%, 45%)',
  'hsl(30, 85%, 55%)',
  'hsl(280, 65%, 55%)',
  'hsl(350, 75%, 55%)',
  'hsl(180, 70%, 45%)',
];

// ✅ helper: texto con contorno sin duplicarlo
const OutlinedText = ({
  x,
  y,
  fill,
  fontSize,
  fontWeight,
  children,
}: {
  x: number;
  y: number;
  fill: string;
  fontSize: number;
  fontWeight: number | string;
  children: React.ReactNode;
}) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
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

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  const getLabelColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  const data = labels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);

    const rawDiff0 = p - i;
    const rawDiff = Math.abs(rawDiff0) < 0.05 ? 0 : rawDiff0;

    const diffColor = rawDiff >= 0 ? '#16a34a' : '#ef4444';

    return {
      subject: label,
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
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <div className="w-full h-[430px] md:h-[480px] overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            outerRadius="58%"
            margin={{ top: 55, right: 85, bottom: 55, left: 85 }}
          >
            <PolarGrid stroke="hsl(var(--border))" />

            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload, index, cx, cy }) => {
                const safeIndex =
                  typeof index === 'number'
                    ? index
                    : data.findIndex((d) => d.subject === String(payload.value));

                const item = data[safeIndex];
                const labelText = String(payload.value);
                const labelColor = getLabelColor(labelText, safeIndex);

                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const baseOffset = isCompetencias ? 42 : 32;

                const nx = cx + (dx / dist) * (dist + baseOffset);
                const ny = cy + (dy / dist) * (dist + baseOffset);

                const words = labelText.split(' ');
                const mid = Math.ceil(words.length / 2);

                const lineCount = words.length > mid ? 2 : 1;
                const numberDy = lineCount === 2 ? 30 : 22;

                const labelFontSize = isCompetencias ? 9.5 : 10;
                const numberFontSize = isCompetencias ? 14 : 16;

                return (
                  <g>
                    <text
                      x={nx}
                      y={ny}
                      fill={labelColor}
                      fontSize={labelFontSize}
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan x={nx}>{words.slice(0, mid).join(' ')}</tspan>
                      {words.length > mid && (
                        <tspan x={nx} dy="1.1em">
                          {words.slice(mid).join(' ')}
                        </tspan>
                      )}
                    </text>

                    {/* ✅ número con contorno SIN duplicado */}
                    {item?.diffLabelOuter != null && (
                      <OutlinedText
                        x={nx}
                        y={ny + numberDy}
                        fill={item.diffColor}
                        fontSize={numberFontSize}
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
              name="Ideal"
              dataKey="ideal"
              stroke="hsl(var(--chart-ideal))"
              fill="hsl(var(--chart-ideal))"
              fillOpacity={0.14}
              strokeWidth={2}
              dot={false}
            />

            <Radar
              name={personName}
              dataKey="persona"
              stroke="hsl(var(--chart-person))"
              fill="hsl(var(--chart-person))"
              fillOpacity={0.26}
              strokeWidth={2}
              dot={false}
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload;

                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-foreground mb-1">{item.subject}</p>

                    <p className="text-sm">
                      Ideal: <span className="font-semibold">{item.ideal}</span>
                    </p>
                    <p className="text-sm">
                      {personName}: <span className="font-semibold">{item.persona}</span>
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
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
``
