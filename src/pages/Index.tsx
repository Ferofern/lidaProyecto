import { useState, useCallback } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { RadarChart } from '@/components/RadarChart';
import { DISCRadarChart } from '@/components/DISCRadarChart';
import { DataTable } from '@/components/DataTable';
import { ChartCard } from '@/components/ChartCard';
import { parseCSV, ProfileData } from '@/lib/csvParser';
import { BarChart3, Users, Brain, Target, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const velnaLabels = ['Verbal', 'Espacial', 'Lógico', 'Numérico', 'Abstracto'];
const discTableLabels = ['D - Dominante', 'I - Influyente', 'S - Sólido', 'C - Cumplido'];

// Datos por defecto para inicializar la aplicación vacía
const defaultData: ProfileData = {
  nombrePersona: 'Sin Datos',
  discPersona: [0, 0, 0, 0],
  discIdeal: [0, 0, 0, 0],
  velnaPersona: [0, 0, 0, 0, 0],
  velnaIdeal: [0, 0, 0, 0, 0],
  compLabels: [],
  compPersona: [],
  compIdeal: []
};

export default function Index() {
  // Inicializamos con defaultData en lugar de null para que siempre se muestre el dashboard
  const [data, setData] = useState<ProfileData>(defaultData);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  // Estado para saber si se cargó un archivo, para mostrar/ocultar el mensaje de estado vacío inferior
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const handleFileLoad = (content: string) => {
    try {
      const parsed = parseCSV(content);
      setData(parsed);
      setIsFileLoaded(true);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      // No reseteamos data a defaultData aquí para mantener lo que el usuario pudo haber escrito
    }
  };

  const handleFileDrop = (content: string) => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    setFileName(input?.files?.[0]?.name || 'archivo.csv');
    handleFileLoad(content);
  };

  // Función para manejar cambios manuales en la tabla DISC
  const handleDiscChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setData(prevData => {
      const newData = { ...prevData };
      // Aseguramos que el valor sea positivo y no NaN
      const sanitizedValue = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const newDiscPersona = [...newData.discPersona];
        newDiscPersona[index] = sanitizedValue;
        newData.discPersona = newDiscPersona;
      } else {
        const newDiscIdeal = [...newData.discIdeal];
        newDiscIdeal[index] = sanitizedValue;
        newData.discIdeal = newDiscIdeal;
      }
      // Si editamos manualmente, cambiamos el nombre si sigue siendo el default
      if (newData.nombrePersona === 'Sin Datos') {
         newData.nombrePersona = 'Perfil Manual';
      }
      return newData;
    });
  }, []);

  // Función para manejar cambios manuales en la tabla VELNA
  const handleVelnaChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setData(prevData => {
      const newData = { ...prevData };
      const sanitizedValue = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const newVelnaPersona = [...newData.velnaPersona];
        newVelnaPersona[index] = sanitizedValue;
        newData.velnaPersona = newVelnaPersona;
      } else {
        const newVelnaIdeal = [...newData.velnaIdeal];
        newVelnaIdeal[index] = sanitizedValue;
        newData.velnaIdeal = newVelnaIdeal;
      }
      if (newData.nombrePersona === 'Sin Datos') {
         newData.nombrePersona = 'Perfil Manual';
      }
      return newData;
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
          {/* Person Info - Siempre visible */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
              <span className="font-medium">{data.nombrePersona}</span>
            </div>

            <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-ideal))]" />
                <span className="text-sm font-medium text-muted-foreground">Perfil Ideal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-person))]" />
                <span className="text-sm font-medium text-muted-foreground">
                  {data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Grid - Siempre visible */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={100}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-disc-dominant/10 p-2">
                  <Target className="h-5 w-5" style={{ color: 'hsl(0, 95%, 45%)' }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Perfil de Comportamiento</span>
              </div>
              <DISCRadarChart
                personaData={data.discPersona}
                idealData={data.discIdeal}
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
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
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
              />
            </ChartCard>

            <ChartCard delay={300}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-secondary/10 p-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Competencias Laborales</span>
              </div>
              {/* Competencias no es editable manualmente por ahora */}
              <RadarChart
                title="Competencias"
                labels={data.compLabels}
                personaData={data.compPersona}
                idealData={data.compIdeal}
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
              />
            </ChartCard>
          </div>

          {/* Tables Grid - Siempre visible y editables (DISC y VELNA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={400}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle DISC</h4>
              <DataTable
                labels={discTableLabels}
                personaData={data.discPersona}
                idealData={data.discIdeal}
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
                editable={true}
                onDataChange={handleDiscChange}
              />
            </ChartCard>

            <ChartCard delay={500}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle VELNA</h4>
              <DataTable
                labels={velnaLabels}
                personaData={data.velnaPersona}
                idealData={data.velnaIdeal}
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
                editable={true}
                onDataChange={handleVelnaChange}
              />
            </ChartCard>

            <ChartCard delay={600}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle Competencias</h4>
              {/* Competencias no editable */}
              <DataTable
                labels={data.compLabels}
                personaData={data.compPersona}
                idealData={data.compIdeal}
                personName={data.nombrePersona === 'Sin Datos' ? 'Persona' : data.nombrePersona}
                editable={false}
              />
            </ChartCard>
          </div>
        </div>

        {/* Empty State Footer - Solo si no se ha cargado archivo y no hay error */}
        {!isFileLoaded && !error && (
          <div className="text-center py-16 text-muted-foreground animate-slide-up">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Puedes cargar un archivo CSV o ingresar datos manualmente en las tablas.</p>
            <p className="text-sm mt-2">El archivo debe estar delimitado por punto y coma (;)</p>
          </div>
        )}
      </main>
    </div>
  );
}