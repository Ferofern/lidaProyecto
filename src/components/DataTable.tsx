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
import { ProfileData } from '@/lib/csvParser';

interface DataTableProps {
  profile: ProfileData;
  editable?: boolean;
  onDataChange?: (index: number, type: 'persona' | 'ideal', value: number) => void;
}

export function DataTable({ profile, editable = false, onDataChange }: DataTableProps) {
  const labels = profile.compLabels;
  const personaData = profile.compPersona;
  const idealData = profile.compIdeal;

  const getDiffColor = (persona: number, ideal: number) =>
    persona >= ideal ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive';

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Variable</TableHead>
            <TableHead className="text-center font-semibold">{profile.nombrePersona}</TableHead>
            <TableHead className="text-center font-semibold">Perfil Ideal</TableHead>
            <TableHead className="text-center font-semibold">Diferencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.map((label, i) => {
            const persona = personaData[i];
            const ideal = idealData[i];
            const diff = Math.abs(ideal - persona);

            return (
              <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{label}</TableCell>

                <TableCell className="text-center p-2">
                  {editable ? (
                    <Input
                      type="number"
                      value={persona}
                      onChange={(e) => onDataChange?.(i, 'persona', Number(e.target.value))}
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
                      value={ideal}
                      onChange={(e) => onDataChange?.(i, 'ideal', Number(e.target.value))}
                      className="h-8 w-20 text-center mx-auto bg-primary/10 border-primary/20 focus-visible:ring-primary"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {ideal.toFixed(1)}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <span className={cn('inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-medium', getDiffColor(persona, ideal))}>
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
