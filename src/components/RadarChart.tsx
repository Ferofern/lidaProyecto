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

// Colors for VELNA cognitive aptitudes
const velnaColors: Record<string, string> = {
  'Verbal': 'hsl(280, 70%, 50%)',
  'Espacial': 'hsl(200, 80%, 50%)',
  'Lógico': 'hsl(35, 90%, 50%)',
  'Numérico': 'hsl(150, 70%, 40%)',
  'Abstracto': 'hsl(340, 75%, 55%)',
};

// Generate colors for competencias dynamically
const competenciaColors = [
  'hsl(220, 80%, 55%)',   // Blue
  'hsl(160, 70%, 45%)',   // Teal
  'hsl(30, 85%, 55%)',    // Orange
  'hsl(280, 65%, 55%)',   // Purple
  'hsl(350, 75%, 55%)',   // Rose
  'hsl(180, 70%, 45%)',   // Cyan
  'hsl(45, 90%, 50%)',    // Yellow
  'hsl(120, 60%, 45%)',   // Green
];

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  // Get color for a label
  const getColor = (label: string, index: number): string => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  const data = labels.map((label, index) => ({
    subject: label,
    persona: personaData[index],
    ideal: idealData[index],
    color: getColor(label, index),
  }));

  // Custom dot component for vertices with circles
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

  const shouldShowColorLegend = isVelna || isCompetencias;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match:</span>
          <span className={`text-lg font-bold ${
            match >= 80 ? 'text-success' : match >= 60 ? 'text-warning' : 'text-destructive'
          }`}>
            {match.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Color legend */}
      {shouldShowColorLegend && (
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {labels.map((label, index) => {
            const color = getColor(label, index);
            return (
              <div 
                key={label}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${color.replace(')', ', 0.15)').replace('hsl', 'hsla')}`,
                  color: color
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: color }}
                />
                <span className="truncate max-w-[80px]">{label}</span>
              </div>
            );
          })}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={({ x, y, payload, index }) => {
              const color = getColor(payload.value, index);
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill={color} 
                  fontSize={11}
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {payload.value.length > 12 ? payload.value.substring(0, 10) + '...' : payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'auto']}
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
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
