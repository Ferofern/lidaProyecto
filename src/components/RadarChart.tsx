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

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);
  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  const data = labels.map((label, index) => {
    const rawP = personaData[index];
    const rawI = idealData[index];
    
    const p = (rawP === undefined || rawP === null || isNaN(rawP)) ? 0 : Number(rawP);
    const i = (rawI === undefined || rawI === null || isNaN(rawI)) ? 0 : Number(rawI);
    
    const diffVal = Math.abs(p - i);
    const isSuccess = p >= i;

    return {
      subject: label,
      persona: p,
      ideal: i,
      color: getColor(label, index),
      calculatedDiff: diffVal.toFixed(1),
      diffColor: isSuccess ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'
    };
  });

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;

    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={payload.diffColor} stroke="white" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          stroke="white"
          strokeWidth={3}
          paintOrder="stroke"
          fill={payload.diffColor}
          fontSize={12}
          fontWeight="900"
        >
          {payload.calculatedDiff}
        </text>
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill={payload.diffColor}
          fontSize={12}
          fontWeight="900"
        >
          {payload.calculatedDiff}
        </text>
      </g>
    );
  };

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
              const offset = 25;
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
            dot={renderDot}
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