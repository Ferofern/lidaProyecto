import { useState, useCallback } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { RadarChart } from '@/components/RadarChart';
import { DISCRadarChart } from '@/components/DISCRadarChart';
import { DataTable } from '@/components/DataTable';
import { ChartCard } from '@/components/ChartCard';
import { parseFile, ProfileData } from '@/lib/csvParser';
import { BarChart3, Users, Brain, Target, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

const velnaLabels = ['Verbal', 'Espacial', 'Lógico', 'Numérico', 'Abstracto'];
const discTableLabels = ['D - Dominante', 'I - Influyente', 'S - Sólido', 'C - Cumplido'];

const defaultData: ProfileData = {
  nombrePersona: 'Persona',
  discPersona: [0, 0, 0, 0],
  discIdeal: [0, 0, 0, 0],
  velnaPersona: [0, 0, 0, 0, 0],
  velnaIdeal: [0, 0, 0, 0, 0],
  compLabels: [],
  compPersona: [],
  compIdeal: [],
  discMatch: 0,
  velnaMatch: 0
};

export default function Index() {
  const [data, setData] = useState<ProfileData>(defaultData);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) return;
        
        const parsed = parseFile(buffer as ArrayBuffer);
        setData(parsed);
        setIsFileLoaded(true);
        setError('');
        setFileName(file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (file: File) => {
    processFile(file);
  };

  const handleNameChange = (value: string) => {
    setData(prev => ({
      ...prev,
      nombrePersona: value.trim() === '' ? 'Persona' : value
    }));
  };

  const handleDiscChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setData(prev => {
      const next = { ...prev };
      const v = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const arr = [...next.discPersona];
        arr[index] = v;
        next.discPersona = arr;
      } else {
        const arr = [...next.discIdeal];
        arr[index] = v;
        next.discIdeal = arr;
      }
      return next;
    });
  }, []);

  const handleVelnaChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setData(prev => {
      const next = { ...prev };
      const v = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const arr = [...next.velnaPersona];
        arr[index] = v;
        next.velnaPersona = arr;
      } else {
        const arr = [...next.velnaIdeal];
        arr[index] = v;
        next.velnaIdeal = arr;
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="gradient-primary rounded-xl p-2">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Matrix Profile Dashboard</h1>
              <p className="text-sm text-muted-foreground">Análisis DISC, VELNA y Competencias</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 max-w-2xl mx-auto">
          <FileDropZone
            onFileLoad={handleFileDrop} 
            isLoaded={isFileLoaded}
            fileName={fileName}
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        <div className="space-y-8 animate-slide-up">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
              <Input
                value={data.nombrePersona}
                onChange={e => handleNameChange(e.target.value)}
                className="h-7 w-48 bg-transparent border-none text-center font-medium focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-ideal))]" />
                <span className="text-sm font-medium text-muted-foreground">Perfil Ideal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-person))]" />
                <span className="text-sm font-medium text-muted-foreground">
                  {data.nombrePersona}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={100}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-disc-dominant/10 p-2">
                  <Target className="h-5 w-5" style={{ color: 'hsl(0, 95%, 45%)' }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Perfil de Conducta</span>
              </div>
              <DISCRadarChart
                personaData={data.discPersona}
                idealData={data.discIdeal}
                personName={data.nombrePersona}
                matchScore={data.discMatch}
              />
            </ChartCard>

            <ChartCard delay={200}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Aptitudes Cognitivas</span>
              </div>
              <RadarChart
                title="VELNA"
                labels={velnaLabels}
                personaData={data.velnaPersona}
                idealData={data.velnaIdeal}
                personName={data.nombrePersona}
                matchScore={data.velnaMatch}
              />
            </ChartCard>

            <ChartCard delay={300}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-secondary/10 p-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Competencias Laborales</span>
              </div>
              <RadarChart
                title="Competencias"
                labels={data.compLabels}
                personaData={data.compPersona}
                idealData={data.compIdeal}
                personName={data.nombrePersona}
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={400}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle DISC</h4>
              <DataTable
                labels={discTableLabels}
                personaData={data.discPersona}
                idealData={data.discIdeal}
                personName={data.nombrePersona}
                editable
                onDataChange={handleDiscChange}
              />
            </ChartCard>

            <ChartCard delay={500}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle VELNA</h4>
              <DataTable
                labels={velnaLabels}
                personaData={data.velnaPersona}
                idealData={data.velnaIdeal}
                personName={data.nombrePersona}
                editable
                onDataChange={handleVelnaChange}
              />
            </ChartCard>

            <ChartCard delay={600}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle Competencias</h4>
              <DataTable
                labels={data.compLabels}
                personaData={data.compPersona}
                idealData={data.compIdeal}
                personName={data.nombrePersona}
                editable={false}
              />
            </ChartCard>
          </div>
        </div>

        {!isFileLoaded && !error && (
          <div className="text-center py-16 text-muted-foreground animate-slide-up">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Puedes cargar un archivo Excel (.xlsx) o CSV.</p>
            <p className="text-sm mt-2">El sistema detectará automáticamente las columnas y filas.</p>
          </div>
        )}
      </main>
    </div>
  );
}