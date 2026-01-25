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
  { key: 'D', name: 'Dominante', color: '#ef4444', desc: 'Directo, firme' },
  { key: 'I', name: 'Influyente', color: '#eab308', desc: 'Extrovertido, negociador' },
  { key: 'S', name: 'Sólido', color: '#84cc16', desc: 'Sereno, paciente' },
  { key: 'C', name: 'Cumplido', color: '#3b82f6', desc: 'Analítico, prudente' },
];

const DecorativeLabels = () => (
  <g pointerEvents="none">
    <text x="50%" y="25" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="bold">Proactividad</text>
    <text x="95%" y="50%" textAnchor="end" dominantBaseline="middle" fontSize="12" fill="#94a3b8" fontWeight="bold">
      <tspan x="98%" dy="-6">Tendencia a</tspan>
      <tspan x="98%" dy="1.2em">las personas</tspan>
    </text>
    <text x="50%" y="95%" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="bold">Receptividad</text>
    <text x="5%" y="50%" textAnchor="start" dominantBaseline="middle" fontSize="12" fill="#94a3b8" fontWeight="bold">
      <tspan x="2%" dy="-6">Tendencia a</tspan>
      <tspan x="2%" dy="1.2em">las tareas</tspan>
    </text>
  </g>
);

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const data = discLabels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);
    
    return {
      subject: label.key,
      fullName: label.name,
      description: label.desc,
      persona: isNaN(p) ? 0 : p,
      ideal: isNaN(i) ? 0 : i,
    };
  });

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;

    const p = Number(payload.persona);
    const i = Number(payload.ideal);
    const diff = Math.abs(p - i).toFixed(1);
    const isSuccess = p >= i;
    
    const color = isSuccess ? '#16a34a' : '#dc2626';

    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          stroke="white"
          strokeWidth={3}
          paintOrder="stroke"
          fill={color}
          fontSize={12}
          fontWeight="bold"
        >
          {diff}
        </text>
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill={color}
          fontSize={12}
          fontWeight="bold"
        >
          {diff}
        </text>
      </g>
    );
  };

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
            <PolarGrid stroke="#e2e8f0" gridType="circle" />
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
                    <text x={dx} y={dy + 14} textAnchor={textAnchor} fill="#94a3b8" fontSize={11}>{label?.desc}</text>
                  </g>
                );
              }}
            />

            <Radar
              name="Perfil Ideal"
              dataKey="ideal"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={renderDot}
            />

            <Radar
              name={personName}
              dataKey="persona"
              stroke="#0f172a"
              fill="#0f172a"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={false}
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload;
                const color = discLabels.find(l => l.key === item.subject)?.color;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold" style={{ color }}>{item.fullName}</p>
                    <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                    <p className="text-sm text-slate-700">Ideal: <span className="font-medium text-blue-600">{item.ideal}</span></p>
                    <p className="text-sm text-slate-700">{personName}: <span className="font-medium text-slate-900">{item.persona}</span></p>
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