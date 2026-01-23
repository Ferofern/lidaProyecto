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
  'Verbal': 'hsl(280, 70%, 50%)',      // Purple
  'Espacial': 'hsl(200, 80%, 50%)',    // Blue
  'Lógico': 'hsl(35, 90%, 50%)',       // Orange
  'Numérico': 'hsl(150, 70%, 40%)',    // Green
  'Abstracto': 'hsl(340, 75%, 55%)',   // Pink/Rose
};

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const isVelna = title === 'VELNA';

  const data = labels.map((label, index) => ({
    subject: label,
    persona: personaData[index],
    ideal: idealData[index],
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

      {/* Color legend for VELNA */}
      {isVelna && (
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {labels.map((label) => (
            <div 
              key={label}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${velnaColors[label]}20`,
                color: velnaColors[label]
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: velnaColors[label] }}
              />
              {label}
            </div>
          ))}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={({ x, y, payload }) => {
              const color = isVelna ? velnaColors[payload.value] : 'hsl(var(--muted-foreground))';
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill={color} 
                  fontSize={11}
                  fontWeight={isVelna ? "600" : "400"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {payload.value}
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
