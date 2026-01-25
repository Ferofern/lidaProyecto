import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Customized,
} from 'recharts';
import { calculateMatch, getMatchColor, ProfileData } from '@/lib/csvParser';

interface DISCRadarChartProps {
  profile: ProfileData;
}

const discLabels = [
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)', desc: 'Directo, firme' },
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)', desc: 'Extrovertido, negociador' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)', desc: 'Sereno, paciente' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)', desc: 'Analítico, prudente' },
];

const DecorativeLabels = () => (
  <g>
    <text x="50%" y="25" textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Proactividad
    </text>
    <text x="95%" y="50%" textAnchor="end" dominantBaseline="middle" fontSize={12} fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="98%" dy="-6">Tendencia a</tspan>
      <tspan x="98%" dy="1.2em">las personas</tspan>
    </text>
    <text x="50%" y="95%" textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))" fontWeight="bold">
      Receptividad
    </text>
    <text x="5%" y="50%" textAnchor="start" dominantBaseline="middle" fontSize={12} fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="2%" dy="-6">Tendencia a</tspan>
      <tspan x="2%" dy="1.2em">las tareas</tspan>
    </text>
  </g>
);

const renderDotWithDiff = (props: any, persona: number, ideal: number) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;

  const diff = Math.abs(ideal - persona);
  const color = persona >= ideal ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
      <text x={cx} y={cy - 10} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
        {diff.toFixed(1)}
      </text>
    </>
  );
};

export function DISCRadarChart({ profile }: DISCRadarChartProps) {
  const data = discLabels.map((label, i) => ({
    subject: label.key,
    fullName: label.name,
    description: label.desc,
    persona: profile.discPersona[i],
    ideal: profile.discIdeal[i],
  }));

  const match = calculateMatch(profile.discPersona, profile.discIdeal);
  const matchColor = getMatchColor(match);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">DISC</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match:</span>
          <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
        </div>
      </div>

      <div className="relative w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="65%" startAngle={140} endAngle={-220}>
            <PolarGrid stroke="hsl(var(--border))" gridType="circle" />
            <PolarAngleAxis dataKey="subject" />
            <Radar dataKey="ideal" stroke="hsl(var(--chart-ideal))" fill="hsl(var(--chart-ideal))" fillOpacity={0.2} strokeWidth={2} dot={(p) => renderDotWithDiff(p, p.payload.persona, p.payload.ideal)} />
            <Radar dataKey="persona" stroke="hsl(var(--chart-person))" fill="hsl(var(--chart-person))" fillOpacity={0.3} strokeWidth={2} dot={() => null} />
            <Tooltip />
            <Customized component={DecorativeLabels} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
