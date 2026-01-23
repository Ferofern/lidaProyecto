import { useState } from 'react';
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

export default function Index() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileLoad = (content: string) => {
    try {
      const parsed = parseCSV(content);
      setData(parsed);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      setData(null);
    }
  };

  const handleFileDrop = (content: string) => {
    // Extraer nombre del archivo del input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    setFileName(input?.files?.[0]?.name || 'archivo.csv');
    handleFileLoad(content);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* File Upload Section */}
        <section className="mb-8 max-w-2xl mx-auto">
          <FileDropZone 
            onFileLoad={handleFileDrop} 
            isLoaded={!!data} 
            fileName={fileName}
          />
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        {/* Dashboard Grid */}
        {data && (
          <div className="space-y-8">
            {/* Person Info */}
            <div className="text-center animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
                <span className="font-medium">{data.nombrePersona}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* DISC */}
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
                  personName={data.nombrePersona}
                />
              </ChartCard>

              {/* VELNA */}
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
                />
              </ChartCard>

              {/* Competencias */}
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

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* DISC Table */}
              <ChartCard delay={400}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle DISC</h4>
                <DataTable
                  labels={discTableLabels}
                  personaData={data.discPersona}
                  idealData={data.discIdeal}
                  personName={data.nombrePersona}
                />
              </ChartCard>

              {/* VELNA Table */}
              <ChartCard delay={500}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle VELNA</h4>
                <DataTable
                  labels={velnaLabels}
                  personaData={data.velnaPersona}
                  idealData={data.velnaIdeal}
                  personName={data.nombrePersona}
                />
              </ChartCard>

              {/* Competencias Table */}
              <ChartCard delay={600}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle Competencias</h4>
                <DataTable
                  labels={data.compLabels}
                  personaData={data.compPersona}
                  idealData={data.compIdeal}
                  personName={data.nombrePersona}
                />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !error && (
          <div className="text-center py-16 text-muted-foreground animate-slide-up">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Carga un archivo CSV para visualizar los datos</p>
            <p className="text-sm mt-2">El archivo debe estar delimitado por punto y coma (;)</p>
          </div>
        )}
      </main>
    </div>
  );
}
