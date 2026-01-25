import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export function DataTable({ labels, personaData, idealData, personName, editable = false, onDataChange }: DataTableProps) {
  const getDiffColor = (persona: number, ideal: number) => persona >= ideal ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Variable</TableHead>
          <TableHead className="text-center">{personName}</TableHead>
          <TableHead className="text-center">Perfil Ideal</TableHead>
          <TableHead className="text-center">Diferencia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {labels.map((label, i) => {
          const persona = personaData[i];
          const ideal = idealData[i];
          const diff = Math.abs(persona - ideal);
          return (
            <TableRow key={i}>
              <TableCell>{label}</TableCell>
              <TableCell className="text-center">{editable ? <Input type="number" value={persona} onChange={(e) => onDataChange?.(i, 'persona', Number(e.target.value))} /> : persona.toFixed(1)}</TableCell>
              <TableCell className="text-center">{editable ? <Input type="number" value={ideal} onChange={(e) => onDataChange?.(i, 'ideal', Number(e.target.value))} /> : ideal.toFixed(1)}</TableCell>
              <TableCell className={cn('text-center', getDiffColor(persona, ideal))}>{diff.toFixed(1)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}