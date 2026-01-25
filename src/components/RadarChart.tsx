import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { calculateMatch } from '@/lib/csvParser';

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
  'hsl(45, 90%, 50%)',
  'hsl(120, 60%, 45%)',
];

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label];
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--foreground))';
  };

  const data = labels.map((label, index) => ({
    subject: label,
    persona: personaData[index],
    ideal: idealData[index],
    color: getColor(label, index),
  }));

  const renderDot = (props: any, color: string) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-lg font-bold">{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, index }) => (
              <text
                x={x}
                y={y}
                fill={getColor(payload.value, index)}
                fontSize={11}
                fontWeight="600"
                textAnchor="middle"
              >
                {payload.value}
              </text>
            )}
          />
          <PolarRadiusAxis domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
            dot={(p) => renderDot(p, 'hsl(var(--chart-ideal))')}
          />
          <Radar
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            dot={(p) => renderDot(p, 'hsl(var(--chart-person))')}
          />
          <Tooltip />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
