import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { calculateMatch, getMatchColor } from '@/lib/csvParser';
import { ProfileData } from '@/lib/csvParser';

interface RadarChartProps {
  title: string;
  profile: ProfileData;
  type: 'VELNA' | 'Competencias';
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
  'hsl(50, 80%, 50%)',
];

const renderDotWithDiff = (props: any, persona: number, ideal: number) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;

  const diff = Math.abs(ideal - persona);
  const color = persona >= ideal ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
      <text
        x={cx}
        y={cy - 10}
        fill={color}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {diff.toFixed(1)}
      </text>
    </>
  );
};

export function RadarChart({ title, profile, type }: RadarChartProps) {
  const labels =
    type === 'VELNA'
      ? ['Verbal', 'Espacial', 'Lógico', 'Numérico', 'Abstracto']
      : profile.compLabels;

  const personaData = type === 'VELNA' ? profile.velnaPersona : profile.compPersona;
  const idealData = type === 'VELNA' ? profile.velnaIdeal : profile.compIdeal;

  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const getColor = (label: string, index: number) => {
    if (type === 'VELNA') return velnaColors[label] || 'hsl(var(--muted-foreground))';
    return competenciaColors[index % competenciaColors.length];
  };

  const data = labels.map((label, index) => ({
    subject: label,
    persona: personaData[index],
    ideal: idealData[index],
    color: getColor(label, index),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={(p) => renderDotWithDiff(p, p.payload.persona, p.payload.ideal)}
          />
          <Radar
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
