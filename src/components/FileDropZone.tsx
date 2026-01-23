import { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileLoad: (content: string) => void;
  isLoaded: boolean;
  fileName?: string;
}

export function FileDropZone({ onFileLoad, isLoaded, fileName }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.readAsText(file, 'latin1');
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all duration-300',
        'hover:border-primary hover:bg-accent/30',
        isDragging && 'drop-zone-active scale-[1.02]',
        isLoaded 
          ? 'border-success bg-success/5' 
          : 'border-border bg-card'
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {isLoaded ? (
          <>
            <div className="rounded-full bg-success/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Archivo cargado</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              'rounded-full p-4 transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}>
              {isDragging ? (
                <FileText className="h-8 w-8 text-primary animate-pulse-subtle" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar (delimitado por ;)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
