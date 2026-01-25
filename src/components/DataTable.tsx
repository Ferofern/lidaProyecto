import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps {
  labels: string[];
  personaData: number[];
  idealData: number[];
  personName: string;
}

export function DataTable({ labels, personaData, idealData, personName }: DataTableProps) {
  if (!labels || labels.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
        Esperando datos...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
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
            const persona = personaData[index] || 0;
            const ideal = idealData[index] || 0;
            const diff = Math.abs(ideal - persona);
            const isGood = persona >= ideal;

            return (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{label}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-secondary/10 text-secondary-foreground font-medium">
                    {persona.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {ideal.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-medium',
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