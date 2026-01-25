
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

  const getLabelColor = (label: string, index: number) => {
    if (isVelna) return velnaColors[label] || 'hsl(var(--muted-foreground))';
    if (isCompetencias) return competenciaColors[index % competenciaColors.length];
    return 'hsl(var(--muted-foreground))';
  };

  // ✅ Data con diferencia
  const data = labels.map((label, index) => {
    const p = Number(personaData?.[index] ?? 0);
    const i = Number(idealData?.[index] ?? 0);

    const rawDiff0 = p - i;
    const rawDiff = Math.abs(rawDiff0) < 0.05 ? 0 : rawDiff0; // evita -0.0

    const isSuccess = rawDiff >= 0;
    const diffColor = isSuccess ? '#16a34a' : '#ef4444';

    // Como tu imagen: número entero sin signo alrededor
    const diffLabelOuter = Math.abs(rawDiff).toFixed(0);

    // Tooltip con signo y decimal (+20.0 / -15.0)
    const diffLabelTooltip = `${rawDiff >= 0 ? '+' : ''}${rawDiff.toFixed(1)}`;

    return {
      subject: label,
      persona: p,
      ideal: i,
      diff: rawDiff,
      diffColor,
      diffLabelOuter,
      diffLabelTooltip,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-lg font-bold ${matchColor}`}>{match.toFixed(1)}%</span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />

          {/* ✅ Etiquetas + DIFERENCIA grande alrededor (como tu imagen) */}
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, index, cx, cy }) => {
              // index normalmente viene; si no, lo buscamos
              const safeIndex =
                typeof index === 'number'
                  ? index
                  : data.findIndex((d) => d.subject === (payload?.value as string));

              const item = data[safeIndex];
              const labelColor = getLabelColor(payload.value, safeIndex);

              // Empujar el tick hacia afuera
              const dx = x - cx;
              const dy = y - cy;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const offset = 26;

              const nx = cx + (dx / distance) * (distance + offset);
              const ny = cy + (dy / distance) * (distance + offset);

              // Nombre en 1-2 líneas si tiene espacios
              const words = String(payload.value).split(' ');
              const mid = Math.ceil(words.length / 2);

              return (
                <g>
                  {/* Nombre */}
                  <text
                    x={nx}
                    y={ny}
                    fill={labelColor}
                    fontSize={10}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan x={nx}>{words.slice(0, mid).join(' ')}</tspan>
                    {words.length > mid && (
                      <tspan x={nx} dy="1.1em">
                        {words.slice(mid).join(' ')}
                      </tspan>
                    )}
                  </text>

                  {/* Número grande (diferencia) */}
                  {item?.diffLabelOuter != null && (
                    <>
                      <text
                        x={nx}
                        y={ny + 22}
                        fill={item.diffColor}
                        fontSize={10}
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        stroke="white"
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {item.diffLabelOuter}
                      </text>

                      <text
                        x={nx}
                        y={ny + 22}
                        fill={item.diffColor}
                        fontSize={16}
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {item.diffLabelOuter}
                      </text>
                    </>
                  )}
                </g>
              );
            }}
          />

          <Radar
            name="Ideal"
            dataKey="ideal"
            stroke="hsl(var(--chart-ideal))"
            fill="hsl(var(--chart-ideal))"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />

          <Radar
            name={personName}
            dataKey="persona"
            stroke="hsl(var(--chart-person))"
            fill="hsl(var(--chart-person))"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={false}
          />

          {/* ✅ Tooltip con Diferencia */}
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const item = payload[0].payload;

              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold text-foreground mb-1">{item.subject}</p>

                  <p className="text-sm">
                    Ideal: <span className="font-semibold">{item.ideal}</span>
                  </p>
                  <p className="text-sm">
                    {personName}: <span className="font-semibold">{item.persona}</span>
                  </p>

                  <p className="text-sm">
                    Diferencia:{' '}
                    <span className="font-bold" style={{ color: item.diffColor }}>
                      {item.diffLabelTooltip}
                    </span>
                  </p>
                </div>
              );
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
