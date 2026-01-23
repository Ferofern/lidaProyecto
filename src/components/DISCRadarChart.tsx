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
  // Reordenar: I, D, C, S (índices originales: D=0, I=1, S=2, C=3)
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

  // Custom dot for vertices with circles
  const renderDot = (props: any, color: string) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">DISC</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match:</span>
          <span className={`text-lg font-bold ${
            match >= 80 ? 'text-success' : match >= 60 ? 'text-warning' : 'text-destructive'
          }`}>
            {match.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* DISC Legend Cards */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {discLabels.map((label) => (
          <div 
            key={label.key}
            className="text-center p-2 rounded-lg"
            style={{ backgroundColor: `${label.color.replace(')', ', 0.1)')}` }}
          >
            <span 
              className="text-lg font-bold"
              style={{ color: label.color }}
            >
              {label.key}
            </span>
            <p className="text-xs text-muted-foreground mt-1">{label.name}</p>
          </div>
        ))}
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
                  fill={label?.color || 'hsl(var(--foreground))'} 
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 120]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Perfil Ideal"
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={(props) => renderDot(props, 'hsl(var(--chart-ideal))')}
          />
          <Radar
            name={personName}
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={(props) => renderDot(props, 'hsl(var(--chart-person))')}
          />
          <Tooltip 
            content={({ payload }) => {
              if (!payload?.length) return null;
              const item = payload[0].payload;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold">{item.fullName}</p>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <p className="text-sm">Ideal: <span className="font-medium text-primary">{item.ideal}</span></p>
                  <p className="text-sm">{personName}: <span className="font-medium text-secondary">{item.persona}</span></p>
                </div>
              );
            }}
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
