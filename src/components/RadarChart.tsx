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
  Verbal: '#9333ea',
  Espacial: '#0ea5e9',
  Lógico: '#f59e0b',
  Numérico: '#10b981',
  Abstracto: '#ec4899',
};

const competenciaColors = [
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
];

// Componente Dot aislado para garantizar acceso al payload completo
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  // Validación estricta: si no hay coordenadas o payload, no dibujar
  if (!cx || !cy || !payload) return null;

  // Extracción directa de valores
  const pVal = Number(payload.persona || 0);
  const iVal = Number(payload.ideal || 0);
  
  // Cálculo de diferencia
  const diff = Math.abs(pVal - iVal).toFixed(1);
  
  // Lógica de color
  const isSuccess = pVal >= iVal;
  const color = isSuccess ? '#16a34a' : '#dc2626'; // Green-600 vs Red-600

  return (
    <g>
      {/* Círculo de fondo para tapar la línea */}
      <circle cx={cx} cy={cy} r={8} fill="white" stroke={color} strokeWidth={2} />
      
      {/* Texto centrado */}
      <text
        x={cx}
        y={cy}
        dy={4} // Ajuste fino vertical para centrar el texto
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

  const getColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || '#94a3b8';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return '#94a3b8';
  };

  // Construcción de datos limpia
  const data = labels.map((label, index) => ({
    subject: label,
    persona: Number(personaData?.[index] ?? 0),
    ideal: Number(idealData?.[index] ?? 0),
    color: getColor(label, index),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, index, cx, cy }) => {
              const color = getColor(payload.value, index);
              const dx = x - cx;
              const dy = y - cy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const offset = 30;
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
                  fontWeight="bold"
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

          {/* El Radar Ideal lleva el CustomDot */}
          <Radar
            name="Ideal"
            dataKey="ideal"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={<CustomDot />} 
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
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 8,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}