import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input'; // Asegúrate de importar el Input
import { cn } from '@/lib/utils';

interface DataTableProps {
  labels: string[];
  personaData: number[];
  idealData: number[];
  personName: string;
  editable?: boolean; // Nueva prop para activar edición
  // Función para comunicar cambios al padre
  onDataChange?: (index: number, type: 'persona' | 'ideal', value: number) => void;
}

export function DataTable({ 
  labels, 
  personaData, 
  idealData, 
  personName,
  editable = false,
  onDataChange
}: DataTableProps) {
  // Si no hay etiquetas (caso competencias vacío), mostrar mensaje
  if (!labels || labels.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm bg-card">
        Esperando datos de competencias...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Variable</TableHead>
            <TableHead className="text-center font-semibold">{personName}</TableHead>
            <TableHead className="text-center font-semibold">Perfil Ideal</TableHead>
            <TableHead className="text-center font-semibold">Diferencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.map((label, index) => {
            // Usamos 0 como fallback si el dato no existe aún
            const persona = personaData[index] ?? 0;
            const ideal = idealData[index] ?? 0;
            // Cálculo automático de la diferencia
            const diff = Math.abs(ideal - persona);
            const isGood = persona >= ideal;

            return (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{label}</TableCell>
                
                {/* Celda Persona: Input si es editable, Span si no */}
                <TableCell className="text-center p-2">
                  {editable ? (
                    <Input
                      type="number"
                      min="0"
                      value={persona.toString()}
                      onChange={(e) => onDataChange?.(index, 'persona', parseFloat(e.target.value) || 0)}
                      className="h-8 w-20 text-center mx-auto bg-secondary/10 border-secondary/20 focus-visible:ring-secondary"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-secondary/10 text-secondary-foreground font-medium">
                      {persona.toFixed(1)}
                    </span>
                  )}
                </TableCell>

                {/* Celda Ideal: Input si es editable, Span si no */}
                <TableCell className="text-center p-2">
                  {editable ? (
                    <Input
                      type="number"
                      min="0"
                      value={ideal.toString()}
                      onChange={(e) => onDataChange?.(index, 'ideal', parseFloat(e.target.value) || 0)}
                      className="h-8 w-20 text-center mx-auto bg-primary/10 border-primary/20 focus-visible:ring-primary"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {ideal.toFixed(1)}
                    </span>
                  )}
                </TableCell>

                {/* Celda Diferencia: Siempre calculada, nunca editable */}
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-medium transition-colors',
                    isGood 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  )}>
                    {diff.toFixed(1)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}