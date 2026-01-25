import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Customized,
} from 'recharts';

interface DISCRadarChartProps {
  personaData: number[];
  idealData: number[];
  personName: string;
}

const discLabels = [
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)', desc: 'Directo, firme' },
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)', desc: 'Extrovertido, negociador' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)', desc: 'Sereno, paciente' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)', desc: 'Analítico, prudente' },
];

const DecorativeLabels = () => (
  <g>
    <text x="50%" y="25" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">Proactividad</text>
    <text x="50%" y="95%" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">Receptividad</text>
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

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  const data = discLabels.map((label, i) => ({
    subject: label.key,
    fullName: label.name,
    description: label.desc,
    persona: personaData[i],
    ideal: idealData[i],
  }));

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">DISC</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="65%" startAngle={140} endAngle={-220}>
          <PolarGrid stroke="hsl(var(--border))" gridType="circle" />
          <PolarAngleAxis dataKey="subject" tick={false} />
          <Radar dataKey="ideal" stroke="hsl(var(--chart-ideal))" fill="hsl(var(--chart-ideal))" fillOpacity={0.2} strokeWidth={2} dot={(p) => renderDotWithDiff(p, p.payload.persona, p.payload.ideal)} />
          <Radar dataKey="persona" stroke="hsl(var(--chart-person))" fill="hsl(var(--chart-person))" fillOpacity={0.3} strokeWidth={2} dot={() => null} />
          <Customized component={DecorativeLabels} />
          <Tooltip />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
