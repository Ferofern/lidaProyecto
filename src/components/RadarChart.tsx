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

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);

  const data = labels.map((label, index) => ({
    subject: label,
    persona: personaData[index],
    ideal: idealData[index],
  }));

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
      
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
          />
          <Radar
            name={personName}
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
              borderRadius: '8px',
            }}
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
