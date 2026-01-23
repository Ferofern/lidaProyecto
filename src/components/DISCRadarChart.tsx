import { calculateMatch } from '@/lib/csvParser';

interface DISCRadarChartProps {
  personaData: number[];
  idealData: number[];
  personName: string;
}

const discQuadrants = [
  { 
    key: 'D', 
    name: 'Dominante', 
    desc: 'Directo, firme,\nmotivado por el riesgo', 
    color: 'hsl(0, 75%, 50%)',
    angle: 135 // Top-left
  },
  { 
    key: 'I', 
    name: 'Influyente', 
    desc: 'Extrovertido,\nnegociador, persuasivo', 
    color: 'hsl(35, 95%, 55%)',
    angle: 45 // Top-right
  },
  { 
    key: 'S', 
    name: 'Sólido', 
    desc: 'Sereno, paciente,\nestable', 
    color: 'hsl(85, 70%, 45%)',
    angle: 315 // Bottom-right
  },
  { 
    key: 'C', 
    name: 'Cumplido', 
    desc: 'Analítico, prudente,\nmetódico', 
    color: 'hsl(205, 100%, 40%)',
    angle: 225 // Bottom-left
  },
];

const axisLabels = [
  { text: 'Proactividad', subtext: '(cantidad)', x: 175, y: 15 },
  { text: 'Tendencia a', subtext: 'las personas', x: 335, y: 175 },
  { text: 'Receptividad', subtext: '(calidad)', x: 175, y: 340 },
  { text: 'Tendencia a', subtext: 'las tareas', x: 15, y: 175 },
];

export function DISCRadarChart({ personaData, idealData, personName }: DISCRadarChartProps) {
  // Reorder: I, D, C, S -> for angles 45, 135, 225, 315
  // Original indices: D=0, I=1, S=2, C=3
  const orderedPersona = [personaData[1], personaData[0], personaData[2], personaData[3]]; // I, D, S, C
  const orderedIdeal = [idealData[1], idealData[0], idealData[2], idealData[3]];
  
  const match = calculateMatch(personaData, idealData);

  const centerX = 175;
  const centerY = 175;
  const maxRadius = 120;
  const gridCircles = [30, 60, 90, 120];

  // Convert angle (in degrees) and value to coordinates
  const polarToCartesian = (angleDeg: number, value: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  };

  // Angles for D, I, S, C positioned at 45-degree intervals
  const angles = [45, 135, 315, 225]; // I, D, S, C positions

  // Create polygon points
  const createPolygonPoints = (values: number[]) => {
    return values.map((val, i) => polarToCartesian(angles[i], val))
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  };

  // Get vertex positions for circles
  const getVertexPositions = (values: number[]) => {
    return values.map((val, i) => polarToCartesian(angles[i], val));
  };

  const personaPoints = createPolygonPoints(orderedPersona);
  const idealPoints = createPolygonPoints(orderedIdeal);
  const personaVertices = getVertexPositions(orderedPersona);
  const idealVertices = getVertexPositions(orderedIdeal);

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

      <div className="relative">
        <svg viewBox="0 0 350 350" className="w-full h-auto max-h-[320px]">
          {/* Colored Arc Segments */}
          <defs>
            {/* Gradient arcs for each quadrant */}
            <linearGradient id="gradD" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 75%, 55%)" />
              <stop offset="100%" stopColor="hsl(0, 75%, 45%)" />
            </linearGradient>
            <linearGradient id="gradI" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(35, 95%, 60%)" />
              <stop offset="100%" stopColor="hsl(35, 95%, 50%)" />
            </linearGradient>
            <linearGradient id="gradS" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(85, 70%, 50%)" />
              <stop offset="100%" stopColor="hsl(85, 70%, 40%)" />
            </linearGradient>
            <linearGradient id="gradC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(205, 100%, 45%)" />
              <stop offset="100%" stopColor="hsl(205, 100%, 35%)" />
            </linearGradient>
          </defs>

          {/* Outer colored ring */}
          <path
            d={describeArc(centerX, centerY, maxRadius + 15, 45, 135)}
            fill="none"
            stroke="url(#gradD)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={describeArc(centerX, centerY, maxRadius + 15, -45, 45)}
            fill="none"
            stroke="url(#gradI)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={describeArc(centerX, centerY, maxRadius + 15, -135, -45)}
            fill="none"
            stroke="url(#gradS)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={describeArc(centerX, centerY, maxRadius + 15, 135, 225)}
            fill="none"
            stroke="url(#gradC)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Grid circles */}
          {gridCircles.map((r) => (
            <circle
              key={r}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Cross lines */}
          <line x1={centerX} y1={centerY - maxRadius - 5} x2={centerX} y2={centerY + maxRadius + 5} 
                stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
          <line x1={centerX - maxRadius - 5} y1={centerY} x2={centerX + maxRadius + 5} y2={centerY} 
                stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />

          {/* Arrows on axes */}
          <polygon points={`${centerX},${centerY - maxRadius - 10} ${centerX - 5},${centerY - maxRadius} ${centerX + 5},${centerY - maxRadius}`} 
                   fill="hsl(var(--muted-foreground))" />
          <polygon points={`${centerX + maxRadius + 10},${centerY} ${centerX + maxRadius},${centerY - 5} ${centerX + maxRadius},${centerY + 5}`} 
                   fill="hsl(var(--muted-foreground))" />
          <polygon points={`${centerX},${centerY + maxRadius + 10} ${centerX - 5},${centerY + maxRadius} ${centerX + 5},${centerY + maxRadius}`} 
                   fill="hsl(var(--muted-foreground))" />
          <polygon points={`${centerX - maxRadius - 10},${centerY} ${centerX - maxRadius},${centerY - 5} ${centerX - maxRadius},${centerY + 5}`} 
                   fill="hsl(var(--muted-foreground))" />

          {/* Ideal profile polygon */}
          <polygon
            points={idealPoints}
            fill="hsl(var(--chart-ideal))"
            fillOpacity="0.15"
            stroke="hsl(var(--chart-ideal))"
            strokeWidth="2"
          />

          {/* Ideal vertices with circles */}
          {idealVertices.map((v, i) => (
            <circle
              key={`ideal-${i}`}
              cx={v.x}
              cy={v.y}
              r="5"
              fill="hsl(var(--chart-ideal))"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Person profile polygon */}
          <polygon
            points={personaPoints}
            fill="hsl(var(--chart-person))"
            fillOpacity="0.25"
            stroke="hsl(var(--chart-person))"
            strokeWidth="2.5"
          />

          {/* Person vertices with circles */}
          {personaVertices.map((v, i) => (
            <circle
              key={`persona-${i}`}
              cx={v.x}
              cy={v.y}
              r="6"
              fill="hsl(var(--chart-person))"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Center labels */}
          <text x={centerX - 15} y={centerY - 5} fontSize="16" fontWeight="bold" fill="hsl(0, 75%, 50%)">D</text>
          <text x={centerX + 8} y={centerY - 5} fontSize="16" fontWeight="bold" fill="hsl(35, 95%, 55%)">I</text>
          <text x={centerX - 15} y={centerY + 18} fontSize="16" fontWeight="bold" fill="hsl(205, 100%, 40%)">C</text>
          <text x={centerX + 8} y={centerY + 18} fontSize="16" fontWeight="bold" fill="hsl(85, 70%, 45%)">S</text>

          {/* Axis labels */}
          {axisLabels.map((label, i) => (
            <g key={i}>
              <text 
                x={label.x} 
                y={label.y} 
                fontSize="11" 
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
                fontWeight="500"
              >
                {label.text}
              </text>
              <text 
                x={label.x} 
                y={label.y + 12} 
                fontSize="10" 
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
                opacity="0.7"
              >
                {label.subtext}
              </text>
            </g>
          ))}
        </svg>

        {/* Quadrant labels positioned around the chart */}
        <div className="absolute top-[8%] left-[2%] text-left">
          <span className="text-sm font-bold" style={{ color: 'hsl(0, 75%, 50%)' }}>Dominante</span>
          <p className="text-xs text-muted-foreground leading-tight">Directo, firme,<br/>motivado por el riesgo</p>
        </div>
        <div className="absolute top-[8%] right-[2%] text-right">
          <span className="text-sm font-bold" style={{ color: 'hsl(35, 95%, 55%)' }}>Influyente</span>
          <p className="text-xs text-muted-foreground leading-tight">Extrovertido,<br/>negociador, persuasivo</p>
        </div>
        <div className="absolute bottom-[8%] left-[2%] text-left">
          <span className="text-sm font-bold" style={{ color: 'hsl(205, 100%, 40%)' }}>Cumplido</span>
          <p className="text-xs text-muted-foreground leading-tight">Analítico, prudente,<br/>metódico</p>
        </div>
        <div className="absolute bottom-[8%] right-[2%] text-right">
          <span className="text-sm font-bold" style={{ color: 'hsl(85, 70%, 45%)' }}>Sólido</span>
          <p className="text-xs text-muted-foreground leading-tight">Sereno, paciente,<br/>estable</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-ideal))' }} />
          <span className="text-muted-foreground">Perfil Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-person))' }} />
          <span className="text-muted-foreground">{personName}</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to create arc paths
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
