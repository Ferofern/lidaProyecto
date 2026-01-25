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
  Verbal: '#9333ea',
  Espacial: '#0ea5e9',
  Lógico: '#f59e0b',
  Numérico: '#10b981',
  Abstracto: '#ec4899',
};

const competenciaColors = [
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
];

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="white" stroke={payload.dotColor} strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        dy={3}
        textAnchor="middle"
        fill={payload.dotColor}
        fontSize={10}
        fontWeight="900"
      >
        {payload.diffLabel}
      </text>
    </g>
  );
};

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);
  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || '#94a3b8';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return '#94a3b8';
  };

  const data = labels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);
    const diff = Math.abs(p - i).toFixed(1);
    const isSuccess = p >= i;

    return {
      subject: label,
      persona: p,
      ideal: i,
      color: getColor(label, index),
      diffLabel: diff,
      dotColor: isSuccess ? '#16a34a' : '#dc2626'
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, index, cx, cy }) => {
              const color = getColor(payload.value, index);
              const dx = x - cx;
              const dy = y - cy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const offset = 30;
              const nx = cx + (dx / distance) * (distance + offset);
              const ny = cy + (dy / distance) * (distance + offset);
              const words = payload.value.split(' ');
              const mid = Math.ceil(words.length / 2);

              return (
                <text
                  x={nx}
                  y={ny}
                  fill={color}
                  fontSize={10}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan x={nx}>{words.slice(0, mid).join(' ')}</tspan>
                  {words.length > mid && (
                    <tspan x={nx} dy="1.1em">{words.slice(mid).join(' ')}</tspan>
                  )}
                </text>
              );
            }}
          />

          <Radar
            name="Ideal"
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={<CustomDot />}
          />

          <Radar
            name={personName}
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={false}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: 8 
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}