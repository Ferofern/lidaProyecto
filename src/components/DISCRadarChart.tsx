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

interface DISCRadarChartProps {
  personaData: number[];
  idealData: number[];
  personName: string;
}

const discLabels = [
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)', desc: 'Extrovertido, negociador' },
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)', desc: 'Directo, firme' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)', desc: 'Analítico, prudente' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)', desc: 'Sereno, paciente' },
];

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  const reorderedPersona = [personaData[1], personaData[0], personaData[3], personaData[2]];
  const reorderedIdeal = [idealData[1], idealData[0], idealData[3], idealData[2]];

  const match = calculateMatch(personaData, idealData);

  const data = discLabels.map((label, index) => ({
    subject: label.key,
    fullName: label.name,
    description: label.desc,
    persona: reorderedPersona[index],
    ideal: reorderedIdeal[index],
  }));

  const renderDot = (props: any, color: string) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">DISC</h3>
        <span className="text-lg font-bold">
          {match.toFixed(1)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload }) => {
              const label = discLabels.find(l => l.key === payload.value);
              return (
                <text
                  x={x}
                  y={y}
                  fill={label?.color}
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis domain={[0, 120]} tick={false} axisLine={false} />
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
