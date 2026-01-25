import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { calculateMatch, getMatchColor } from '@/lib/csvParser';

interface RadarChartProps {
  title: string;
  labels: string[];
  personaData: number[];
  idealData: number[];
  personName: string;
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
];

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  // Mapeo seguro de datos: Convierte undefined/null a 0 explícitamente
  const data = labels.map((label, index) => ({
    subject: label,
    persona: Number(personaData?.[index] ?? 0),
    ideal: Number(idealData?.[index] ?? 0),
    color: getColor(label, index),
  }));

  // Función de renderizado del punto (Dot)
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Si Recharts no pasa las coordenadas o el payload, no renderizar nada
    if (!cx || !cy || !payload) return null;

    const pVal = Number(payload.persona);
    const iVal = Number(payload.ideal);
    
    // Calculamos la diferencia
    const diff = Math.abs(pVal - iVal);
    
    // Lógica de color: Verde si Persona >= Ideal, Rojo si no
    // Usamos colores hardcoded HSL para asegurar visibilidad si las variables CSS fallan
    // Verde: success, Rojo: destructive
    const isSuccess = pVal >= iVal;
    const fillColor = isSuccess ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';

    return (
      <g>
        {/* Círculo del vértice */}
        <circle cx={cx} cy={cy} r={6} fill={fillColor} stroke="white" strokeWidth={2} />
        
        {/* Texto con borde blanco para legibilidad (stroke) */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          stroke="white"
          strokeWidth={3}
          paintOrder="stroke"
          fill={fillColor}
          fontSize={12}
          fontWeight="900"
        >
          {diff.toFixed(1)}
        </text>
        {/* Texto superior nítido */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill={fillColor}
          fontSize={12}
          fontWeight="900"
        >
          {diff.toFixed(1)}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, index, cx, cy }) => {
              const color = getColor(payload.value, index);
              const dx = x - cx;
              const dy = y - cy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const offset = 25; // Un poco más lejos para no tapar el dot
              const nx = cx + (dx / distance) * (distance + offset);
              const ny = cy + (dy / distance) * (distance + offset);
              
              const words = payload.value.split(' ');
              const mid = Math.ceil(words.length / 2);

              return (
                <text
                  x={nx}
                  y={ny}
                  fill={color}
                  fontSize={10}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan x={nx}>{words.slice(0, mid).join(' ')}</tspan>
                  {words.length > mid && (
                    <tspan x={nx} dy="1.1em">{words.slice(mid).join(' ')}</tspan>
                  )}
                </text>
              );
            }}
          />

          {/* Radar Ideal: Lleva los Dots personalizados */}
          <Radar
            name="Ideal"
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={renderCustomDot}
          />

          {/* Radar Persona: Sin dots para no duplicar */}
          <Radar
            name={personName}
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={false}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: 8 
            }}
            formatter={(value: number) => value.toFixed(1)}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}