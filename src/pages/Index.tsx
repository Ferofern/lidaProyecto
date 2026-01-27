import { useState, useCallback } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { RadarChart } from '@/components/RadarChart';
import { DISCRadarChart } from '@/components/DISCRadarChart';
import { DataTable } from '@/components/DataTable';
import { ChartCard } from '@/components/ChartCard';
import { parseFile, ProfileData } from '@/lib/csvParser';
import { 
  BarChart3, Users, Brain, Target, AlertCircle, 
  ChevronLeft, ChevronRight, Briefcase, UserCog 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const velnaLabels = ['Verbal', 'Espacial', 'Lógico', 'Numérico', 'Abstracto'];
const discTableLabels = ['D - Dominante', 'I - Influyente', 'S - Sólido', 'C - Cumplido'];

const defaultProfile: ProfileData = {
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

type RoleType = 'Jefe' | 'Gerente';

export default function Index() {
  const [profiles, setProfiles] = useState<ProfileData[]>([defaultProfile]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [role, setRole] = useState<RoleType>('Jefe');
  
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  // Perfil actual
  const currentData = profiles[currentIndex];

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) return;
        
        const parsedProfiles = parseFile(buffer as ArrayBuffer);
        
        if (parsedProfiles.length > 0) {
          setProfiles(parsedProfiles);
          setCurrentIndex(0);
          setIsFileLoaded(true);
          setError('');
          setFileName(file.name);
        }
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

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevProfile = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const updateCurrentProfile = (updater: (profile: ProfileData) => ProfileData) => {
    setProfiles(prev => {
      const newProfiles = [...prev];
      newProfiles[currentIndex] = updater(newProfiles[currentIndex]);
      return newProfiles;
    });
  };

  const handleNameChange = (value: string) => {
    updateCurrentProfile(p => ({ ...p, nombrePersona: value }));
  };

  const handleDiscChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setProfiles(prevProfiles => {
      const newProfiles = [...prevProfiles];
      const current = { ...newProfiles[currentIndex] };
      const v = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const arr = [...current.discPersona];
        arr[index] = v;
        current.discPersona = arr;
      } else {
        const arr = [...current.discIdeal];
        arr[index] = v;
        current.discIdeal = arr;
      }
      
      newProfiles[currentIndex] = current;
      return newProfiles;
    });
  }, [currentIndex]);

  const handleVelnaChange = useCallback((index: number, type: 'persona' | 'ideal', value: number) => {
    setProfiles(prevProfiles => {
      const newProfiles = [...prevProfiles];
      const current = { ...newProfiles[currentIndex] };
      const v = isNaN(value) ? 0 : Math.max(0, value);

      if (type === 'persona') {
        const arr = [...current.velnaPersona];
        arr[index] = v;
        current.velnaPersona = arr;
      } else {
        const arr = [...current.velnaIdeal];
        arr[index] = v;
        current.velnaIdeal = arr;
      }

      newProfiles[currentIndex] = current;
      return newProfiles;
    });
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-xl p-2">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Matrix Profile Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Análisis <span className="font-semibold text-primary">{role}</span>
                </p>
              </div>
            </div>

            {/* Switch de Rol */}
            <div className="flex bg-secondary/30 p-1 rounded-lg self-start md:self-auto">
              <button
                onClick={() => setRole('Jefe')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  role === 'Jefe' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCog className="h-4 w-4" />
                Jefe
              </button>
              <button
                onClick={() => setRole('Gerente')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  role === 'Gerente' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Gerente
              </button>
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

        {isFileLoaded && (
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm animate-slide-up">
            
            {/* Cinta de Navegación */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-center">
              <Button 
                variant="outline" 
                size="icon"
                onClick={prevProfile}
                disabled={currentIndex === 0}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex flex-col items-center min-w-[200px]">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                  Empleado {currentIndex + 1} de {profiles.length}
                </span>
                <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1 rounded-md">
                  <Users className="h-4 w-4 text-primary" />
                  <Input
                    value={currentData.nombrePersona}
                    onChange={e => handleNameChange(e.target.value)}
                    className="h-6 w-48 bg-transparent border-none text-center font-bold text-base focus-visible:ring-0 px-0 shadow-none"
                  />
                </div>
              </div>

              <Button 
                variant="outline" 
                size="icon"
                onClick={nextProfile}
                disabled={currentIndex === profiles.length - 1}
                className="h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/20 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--chart-ideal))] border border-white/20 shadow-sm" />
                <span className="font-medium text-muted-foreground">Perfil Ideal</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--chart-person))] border border-white/20 shadow-sm" />
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {currentData.nombrePersona}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8 animate-slide-up">
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={100}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-disc-dominant/10 p-2">
                  <Target className="h-5 w-5" style={{ color: 'hsl(0, 95%, 45%)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Perfil de Comportamiento</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{role}</span>
                </div>
              </div>
              <DISCRadarChart
                personaData={currentData.discPersona}
                idealData={currentData.discIdeal}
                personName={currentData.nombrePersona}
                matchScore={currentData.discMatch}
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
                personaData={currentData.velnaPersona}
                idealData={currentData.velnaIdeal}
                personName={currentData.nombrePersona}
                matchScore={currentData.velnaMatch}
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
                labels={currentData.compLabels}
                personaData={currentData.compPersona}
                idealData={currentData.compIdeal}
                personName={currentData.nombrePersona}
              />
            </ChartCard>
          </div>

          {/* Tablas de Datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard delay={400}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle DISC ({role})</h4>
              <DataTable
                labels={discTableLabels}
                personaData={currentData.discPersona}
                idealData={currentData.discIdeal}
                personName={currentData.nombrePersona}
                editable
                onDataChange={handleDiscChange}
              />
            </ChartCard>

            <ChartCard delay={500}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle VELNA</h4>
              <DataTable
                labels={velnaLabels}
                personaData={currentData.velnaPersona}
                idealData={currentData.velnaIdeal}
                personName={currentData.nombrePersona}
                editable
                onDataChange={handleVelnaChange}
              />
            </ChartCard>

            <ChartCard delay={600}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Detalle Competencias</h4>
              <DataTable
                labels={currentData.compLabels}
                personaData={currentData.compPersona}
                idealData={currentData.compIdeal}
                personName={currentData.nombrePersona}
                editable={false}
              />
            </ChartCard>
          </div>
        </div>

        {!isFileLoaded && !error && (
          <div className="text-center py-16 text-muted-foreground animate-slide-up">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Carga un archivo Excel (.xlsx) o CSV.</p>
            <p className="text-sm mt-2">El sistema procesará automáticamente a todos los empleados.</p>
          </div>
        )}
      </main>
    </div>
  );
}