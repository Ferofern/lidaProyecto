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
  matchScore?: number; // ✅ Nueva prop para el match real del CSV
}

const discLabels = [
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)', desc: 'Directo, firme' },
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)', desc: 'Extrovertido, negociador' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)', desc: 'Sereno, paciente' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)', desc: 'Analítico, prudente' },
];

/** Textos decorativos ajustados a la altura compacta */
const DecorativeLabels = () => (
  <g pointerEvents="none">
    {/* Arriba */}
    <text x="50%" y="15" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Proactividad
    </text>

    {/* Derecha */}
    <text x="96%" y="50%" textAnchor="end" dominantBaseline="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="98%" dy="-6">Tendencia a</tspan>
      <tspan x="98%" dy="1.2em">personas</tspan>
    </text>

    {/* Abajo */}
    <text x="50%" y="97%" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Receptividad
    </text>

    {/* Izquierda */}
    <text x="4%" y="50%" textAnchor="start" dominantBaseline="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="2%" dy="-6">Tendencia a</tspan>
      <tspan x="2%" dy="1.2em">tareas</tspan>
    </text>
  </g>
);

/** Componente para texto con borde (Stroke) */
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
  // ✅ CORRECCIÓN TS: Tipado estricto para evitar el error
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

export function DISCRadarChart({ personaData, idealData, personName, matchScore }: DISCRadarChartProps) {
  // ✅ Usamos el match del CSV si existe, si no, calculamos (fallback)
  const finalMatch = matchScore ?? calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(finalMatch);

  const data = discLabels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);
    const rawDiff = p - i;
    const absDiff = Math.abs(rawDiff);
    // Evitar -0.0 visual
    const finalDiff = absDiff < 0.1 ? 0 : rawDiff;
    
    return {
      subject: label.key,
      name: label.name,
      desc: label.desc,
      persona: p,
      ideal: i,
      color: label.color,
      // Lógica de color: Verde si supera/iguala, Rojo si falta
      diffColor: finalDiff >= 0 ? '#16a34a' : '#ef4444',
      diffLabel: Math.round(absDiff).toString(),
      tooltipDiff: (finalDiff > 0 ? '+' : '') + finalDiff.toFixed(1)
    };
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Cabecera compacta */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">DISC</h3>
        <div className="flex items-center gap-2 bg-secondary/20 px-2 py-0.5 rounded-full">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Match</span>
          <span className={`text-sm font-extrabold ${matchColor}`}>{finalMatch.toFixed(0)}%</span>
        </div>
      </div>

      {/* ✅ ALTURA CONTROLADA: Compacta (~320px) */}
      <div className="relative w-full h-[300px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="65%" // Radio ajustado para que quepan las etiquetas en altura reducida
            startAngle={135} 
            endAngle={-225}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <PolarGrid stroke="hsl(var(--border))" gridType="circle" />
            
            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload }) => {
                const key = payload.value;
                const item = data.find(d => d.subject === key);
                
                // ✅ CORRECCIÓN TS: Declarar explícitamente el tipo de la variable
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                let dx = 0; 
                let dy = 0;

                // Ajuste fino de posiciones para D, I, S, C
                if (key === 'D') { textAnchor = 'end'; dx = -15; dy = -10; }
                if (key === 'I') { textAnchor = 'start'; dx = 15; dy = -10; }
                if (key === 'S') { textAnchor = 'start'; dx = 15; dy = 15; }
                if (key === 'C') { textAnchor = 'end'; dx = -15; dy = 15; }

                return (
                  <g transform={`translate(${x},${y})`}>
                    {/* Título (D, I, S, C) */}
                    <text 
                      x={dx} y={dy} 
                      textAnchor={textAnchor} 
                      fill={item?.color} 
                      fontSize={14} 
                      fontWeight="900"
                    >
                      {item?.name}
                    </text>
                    
                    {/* Descripción pequeña */}
                    <text 
                      x={dx} y={dy + 12} 
                      textAnchor={textAnchor} 
                      fill="hsl(var(--muted-foreground))" 
                      fontSize={9} 
                      fontWeight="500"
                    >
                      {item?.desc}
                    </text>

                    {/* Número de diferencia */}
                    {item && (
                      <OutlinedText 
                        x={dx} y={dy + 28} 
                        textAnchor={textAnchor} 
                        fill={item.diffColor} 
                        fontSize={16} 
                        fontWeight="900"
                      >
                        {item.diffLabel}
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
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-popover border border-border shadow-xl rounded-md p-2 text-xs">
                    <p className="font-bold mb-1" style={{ color: d.color }}>{d.name}</p>
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
            <Customized component={DecorativeLabels} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}