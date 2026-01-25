import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DataTableProps {
  labels: string[];
  personaData: number[];
  idealData: number[];
  personName: string;
  editable?: boolean;
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
  if (!labels || labels.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm bg-card">
        Esperando datos de competencias...
      </div>
    );
  }

  const getMatchColor = (match: number) => {
    if (match < 60) return 'bg-destructive/10 text-destructive';
    if (match < 80) return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-success/10 text-success';
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Variable</TableHead>
            <TableHead className="text-center font-semibold">{personName}</TableHead>
            <TableHead className="text-center font-semibold">Perfil Ideal</TableHead>
            <TableHead className="text-center font-semibold">Diferencia</TableHead>
            <TableHead className="text-center font-semibold">% Match</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {labels.map((label, index) => {
            const persona = personaData[index] ?? 0;
            const ideal = idealData[index] ?? 0;
            const diff = Math.abs(ideal - persona);
            const match =
              ideal === 0 ? 100 : Math.max(0, Math.min(100, (persona / ideal) * 100));

            return (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">
                  {label}
                </TableCell>

                <TableCell className="text-center p-2">
                  {editable ? (
                    <Input
                      type="number"
                      min="0"
                      value={persona}
                      onChange={(e) =>
                        onDataChange?.(
                          index,
                          'persona',
                          e.target.value === '' ? 0 : Number(e.target.value)
                        )
                      }
                      className="h-8 w-20 text-center mx-auto bg-secondary/10 border-secondary/20 focus-visible:ring-secondary"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-secondary/10 text-secondary-foreground font-medium">
                      {persona.toFixed(1)}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-center p-2">
                  {editable ? (
                    <Input
                      type="number"
                      min="0"
                      value={ideal}
                      onChange={(e) =>
                        onDataChange?.(
                          index,
                          'ideal',
                          e.target.value === '' ? 0 : Number(e.target.value)
                        )
                      }
                      className="h-8 w-20 text-center mx-auto bg-primary/10 border-primary/20 focus-visible:ring-primary"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {ideal.toFixed(1)}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-muted/30 font-medium">
                    {diff.toFixed(1)}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[3.5rem] px-2 py-1 rounded-md font-medium',
                      getMatchColor(match)
                    )}
                  >
                    {match.toFixed(0)}%
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
