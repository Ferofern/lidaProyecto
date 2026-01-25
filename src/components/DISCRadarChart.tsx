import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { calculateMatch, getMatchColor } from '@/lib/csvParser';

interface DISCRadarChartProps {
  personaData: number[];
  idealData: number[];
  personName: string;
}

const discLabels = [
  { key: 'I', name: 'Influyente', color: 'hsl(35, 95%, 55%)' },
  { key: 'D', name: 'Dominante', color: 'hsl(0, 95%, 45%)' },
  { key: 'C', name: 'Cumplido', color: 'hsl(205, 100%, 35%)' },
  { key: 'S', name: 'Sólido', color: 'hsl(85, 70%, 45%)' },
];

export function DISCRadarChart({ personaData, idealData }: DISCRadarChartProps) {
  const reorderedPersona = [personaData[1], personaData[0], personaData[3], personaData[2]];
  const reorderedIdeal = [idealData[1], idealData[0], idealData[3], idealData[2]];

  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const data = discLabels.map((label, index) => ({
    subject: label.key,
    persona: reorderedPersona[index],
    ideal: reorderedIdeal[index],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">DISC</h3>
        <span className={`text-lg font-bold ${matchColor}`}>
          {match}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis tick={false} />
          <Radar
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
          />
          <Radar
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
          />
          <Tooltip />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
