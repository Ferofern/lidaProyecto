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

function splitToLines(label: string, maxCharsPerLine: number, maxLines: number) {
  const words = label.split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  const remainingWords = words.slice(lines.join(' ').split(' ').filter(Boolean).length);
  if (lines.length < maxLines) {
    const last = [current, ...remainingWords].filter(Boolean).join(' ');
    if (last) lines.push(last);
  }
  if (lines.length > maxLines) lines.length = maxLines;
  const lastIdx = lines.length - 1;
  if (lines[lastIdx]?.length > maxCharsPerLine) {
    lines[lastIdx] = lines[lastIdx].slice(0, Math.max(0, maxCharsPerLine - 1)).trimEnd() + '…';
  }
  return lines;
}

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

  // ✅ ALTURA REDUCIDA: aprox 400px en lugar de 600px
  const chartHeight = isCompetencias ? 'h-[400px] md:h-[440px]' : 'h-[360px] md:h-[400px]';
  const outerRadius = isCompetencias ? '68%' : '72%';

  // ✅ Márgenes mínimos
  const margin = { top: 20, right: 40, bottom: 20, left: 40 };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <div className={`w-full ${chartHeight} overflow-visible`}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} outerRadius={outerRadius} margin={margin}>
            <PolarGrid stroke="hsl(var(--border))" />

            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload, index, cx, cy }) => {
                const safeIndex = typeof index === 'number' ? index : data.findIndex((d) => d.subject === String(payload.value));
                const item = data[safeIndex];
                const labelText = String(payload.value);
                const labelColor = getLabelColor(labelText, safeIndex);

                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // ✅ Etiquetas más pegadas al gráfico (offset reducido)
                const baseOffset = isCompetencias ? 22 : 18;
                
                const nx = cx + (dx / dist) * (dist + baseOffset);
                const ny = cy + (dy / dist) * (dist + baseOffset);

                const maxLines = isCompetencias ? 3 : 2;
                const maxChars = isCompetencias ? 14 : 16;
                const lines = splitToLines(labelText, maxChars, maxLines);

                const labelFontSize = isCompetencias ? 9 : 10;
                const numberFontSize = isCompetencias ? 13 : 15;

                // Texto del número pegadito a la etiqueta
                const numberDy = 16 + (lines.length - 1) * 10;

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
                      {lines.map((ln, i) => (
                        <tspan key={i} x={nx} dy={i === 0 ? 0 : '1.1em'}>
                          {ln}
                        </tspan>
                      ))}
                    </text>

                    {item?.diffLabelOuter != null && (
                      <OutlinedText x={nx} y={ny + numberDy} fill={item.diffColor} fontSize={numberFontSize} fontWeight={900}>
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
                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-semibold mb-1" style={{ color: item.diffColor }}>{item.subject}</p>
                    <div className="flex gap-3 justify-between">
                      <span>Ideal: <b>{item.ideal}</b></span>
                      <span>{personName}: <b>{item.persona}</b></span>
                    </div>
                    <p className="mt-1">
                      Dif: <b style={{ color: item.diffColor }}>{item.diffLabelTooltip}</b>
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