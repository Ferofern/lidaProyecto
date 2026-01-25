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

// Componente Dot personalizado que calcula la diferencia en el momento de renderizar
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;

  // Validación: si faltan datos clave, no renderizar
  if (!cx || !cy || !payload) return null;

  // Extraer valores asegurando que sean números, defaulting a 0
  const persona = Number(payload.persona || 0);
  const ideal = Number(payload.ideal || 0);

  // Calcular la diferencia
  const diff = Math.abs(persona - ideal).toFixed(1);

  // Determinar el color: Verde si Persona >= Ideal, Rojo si no.
  // Usamos HEX para garantizar el color exacto.
  const isSuccess = persona >= ideal;
  const color = isSuccess ? '#22c55e' : '#ef4444'; // green-500 vs red-500

  return (
    <g>
      {/* Círculo con fondo blanco para que el texto sea legible */}
      <circle cx={cx} cy={cy} r={8} fill="white" stroke={color} strokeWidth={2} />
      {/* Texto centrado */}
      <text
        x={cx}
        y={cy}
        dy={3} // Ajuste vertical fino
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontWeight="900"
      >
        {diff}
      </text>
    </g>
  );
};

export function RadarChart({ title, labels, personaData, idealData, personName }: RadarChartProps) {
  const match = calculateMatch(personaData, idealData);
  const matchColor = getMatchColor(match);

  const isVelna = title === 'VELNA';
  const isCompetencias = title === 'Competencias';

  // Función original para obtener el color de la etiqueta
  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  // Construcción de datos asegurando que no haya nulos/NaN
  const data = labels.map((label, index) => ({
    subject: label,
    persona: Number(personaData?.[index] ?? 0),
    ideal: Number(idealData?.[index] ?? 0),
  }));

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
            // Lógica original para colorear y posicionar las etiquetas
            tick={({ x, y, payload, index, cx, cy }) => {
              const color = getColor(payload.value, index);
              const dx = x - cx;
              const dy = y - cy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const offset = 30; // Un poco más de espacio para que no se monte sobre el dot
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
            dot={<CustomDot />}
          />

          {/* Radar Persona: Sin dots */}
          <Radar
            name={personName}
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={false}
          />

          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}