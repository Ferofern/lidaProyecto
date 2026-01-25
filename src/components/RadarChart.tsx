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
  matchScore?: number;
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

const OutlinedText = ({ x, y, fill, fontSize, fontWeight, children }: any) => (
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

function splitText(text: string, maxLen: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    if ((current + ' ' + words[i]).length <= maxLen) {
      current += ' ' + words[i];
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines.length > 3 ? [lines[0], lines[1], '...'] : lines;
}

export function RadarChart({ title, labels, personaData, idealData, personName, matchScore }: RadarChartProps) {
  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  let finalMatch = 0;
  if (isCompetencias) {
    finalMatch = calculateMatch(personaData, idealData);
  } else {
    finalMatch = matchScore ?? 0;
  }

  const matchColor = getMatchColor(finalMatch);

  const getColor = (label: string, idx: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    return competenciaColors[idx % competenciaColors.length];
  };

  const data = labels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);
    const rawDiff = p - i;
    
    // Evitar -0.0 visual
    const finalDiff = Math.abs(rawDiff) < 0.1 ? 0 : rawDiff;
    const roundedDiff = Math.round(finalDiff);
    
    return {
      subject: label,
      persona: p,
      ideal: i,
      color: getColor(label, index),
      diffColor: finalDiff >= 0 ? '#16a34a' : '#ef4444',
      // ✅ AQUI EL CAMBIO: Añadimos el '+' si es positivo
      diffLabel: (roundedDiff > 0 ? '+' : '') + roundedDiff,
      tooltipDiff: (finalDiff > 0 ? '+' : '') + finalDiff.toFixed(1)
    };
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{title}</h3>
        <div className="flex items-center gap-2 bg-secondary/20 px-2 py-0.5 rounded-full">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Match</span>
          <span className={`text-sm font-extrabold ${matchColor}`}>{finalMatch.toFixed(0)}%</span>
        </div>
      </div>

      <div className="relative w-full h-[300px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart 
            data={data} 
            outerRadius={isCompetencias ? "65%" : "70%"} 
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid stroke="hsl(var(--border))" />
            
            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload, index, cx, cy }) => {
                const idx = typeof index === 'number' ? index : 0;
                const d = data[idx] || data.find(i => i.subject === payload.value);
                if (!d) return null;

                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const offset = isCompetencias ? 18 : 22; 
                const nx = cx + (dx/dist) * (dist + offset);
                const ny = cy + (dy/dist) * (dist + offset);

                const lines = splitText(d.subject, isCompetencias ? 12 : 15);
                const lineHeight = 10;
                
                return (
                  <g>
                    <text 
                      x={nx} y={ny} 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      fill={d.color}
                      fontSize={isCompetencias ? 9 : 10}
                      fontWeight="700"
                    >
                      {lines.map((line, i) => (
                        <tspan key={i} x={nx} dy={i === 0 ? -(lines.length-1)*lineHeight/2 : lineHeight}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                    
                    <OutlinedText 
                      x={nx} 
                      y={ny + (lines.length * 6) + 8} 
                      fill={d.diffColor} 
                      fontSize={14} 
                      fontWeight="900"
                    >
                      {d.diffLabel}
                    </OutlinedText>
                  </g>
                );
              }}
            />

            <Radar
              name="Ideal"
              dataKey="ideal"
              stroke="hsl(var(--chart-ideal))"
              fill="hsl(var(--chart-ideal))"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
            <Radar
              name={personName}
              dataKey="persona"
              stroke="hsl(var(--chart-person))"
              fill="hsl(var(--chart-person))"
              fillOpacity={0.3}
              strokeWidth={2}
            />

            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-popover border border-border shadow-xl rounded-md p-2 text-xs">
                    <p className="font-bold mb-1" style={{ color: d.color }}>{d.subject}</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <span className="text-muted-foreground">Ideal:</span>
                      <span className="font-mono font-bold text-right">{d.ideal}</span>
                      <span className="text-muted-foreground">{personName}:</span>
                      <span className="font-mono font-bold text-right">{d.persona}</span>
                      <span className="text-muted-foreground">Dif:</span>
                      <span className="font-mono font-bold text-right" style={{ color: d.diffColor }}>{d.tooltipDiff}</span>
                    </div>
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