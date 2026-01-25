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
    <text x="95%" y="50%" textAnchor="end" dominantBaseline="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="98%" dy="-6">Tendencia a</tspan>
      <tspan x="98%" dy="1.2em">las personas</tspan>
    </text>
    <text x="50%" y="95%" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">Receptividad</text>
    <text x="5%" y="50%" textAnchor="start" dominantBaseline="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
      <tspan x="2%" dy="-6">Tendencia a</tspan>
      <tspan x="2%" dy="1.2em">las tareas</tspan>
    </text>
  </g>
);

const renderDotWithDiff = (props: any, persona: number, ideal: number) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;

  const personaNum = Number(persona) || 0;
  const idealNum = Number(ideal) || 0;
  const diff = Math.abs(idealNum - personaNum);
  const color = personaNum >= idealNum ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

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

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const data = discLabels.map((label, index) => ({
    subject: label.key,
    fullName: label.name,
    description: label.desc,
    persona: Number(personaData[index]) || 0,
    ideal: Number(idealData[index]) || 0,
  }));

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
            <PolarAngleAxis
              dataKey="subject"
              tick={({ x, y, payload }) => {
                const label = discLabels.find(l => l.key === payload.value);
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                let dx = 0;
                let dy = 0;
                if (payload.value === 'D') { textAnchor = 'end'; dx = -15; dy = -10; }
                if (payload.value === 'I') { textAnchor = 'start'; dx = 15; dy = -10; }
                if (payload.value === 'S') { textAnchor = 'start'; dx = 15; dy = 20; }
                if (payload.value === 'C') { textAnchor = 'end'; dx = -15; dy = 20; }

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={dx} y={dy} textAnchor={textAnchor} fill={label?.color} fontSize={16} fontWeight="bold">{label?.name}</text>
                    <text x={dx} y={dy + 14} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" fontSize={11}>{label?.desc}</text>
                  </g>
                );
              }}
            />

            <Radar
              name="Perfil Ideal"
              dataKey="ideal"
              stroke="hsl(var(--chart-ideal))"
              fill="hsl(var(--chart-ideal))"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={(p) => renderDotWithDiff(p, p.payload.persona, p.payload.ideal)}
            />

            <Radar
              name={personName}
              dataKey="persona"
              stroke="hsl(var(--chart-person))"
              fill="hsl(var(--chart-person))"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={() => null}
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload;
                const color = discLabels.find(l => l.key === item.subject)?.color;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold" style={{ color }}>{item.fullName}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-sm">Ideal: <span className="font-medium text-primary">{item.ideal}</span></p>
                    <p className="text-sm">{personName}: <span className="font-medium text-secondary">{item.persona}</span></p>
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
