import * as XLSX from 'xlsx';

export interface ProfileData {
  nombrePersona: string;
  discPersona: number[];
  discIdeal: number[];
  velnaPersona: number[];
  velnaIdeal: number[];
  compLabels: string[];
  compPersona: number[];
  compIdeal: number[];
  discMatch: number;
  velnaMatch: number;
}

function extractNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const text = String(value);
  
  // Busca números decimales o enteros
  const match = text.match(/-?\d+(\.\d+)?/);
  
  // Manejo de decimales con coma (ej: "80,5")
  if (!match && text.includes(',')) {
    const normalized = text.replace(',', '.');
    const matchComma = normalized.match(/-?\d+(\.\d+)?/);
    return matchComma ? parseFloat(matchComma[0]) : 0;
  }
  return match ? parseFloat(match[0]) : 0;
}

export function parseFile(data: ArrayBuffer | string): ProfileData[] {
  const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'string' : 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Leemos todo como una matriz de arrays
  // defval: '' evita errores con celdas vacías
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  if (rows.length < 3) {
    throw new Error('El archivo debe tener al menos 3 filas (Encabezados, Ideal, Personas)');
  }

  // --- DEFINICIÓN DE FILAS CLAVE ---
  const headerRow = rows[0]; // Fila 1 (Encabezados)
  const idealRow = rows[1];  // Fila 2 (SIEMPRE contiene los PERFILES IDEALES)
  
  // --- EXTRACCIÓN DE IDEALES (FIJOS PARA TODOS) ---
  // DISC Ideal: Columnas 31, 32, 33, 34 de la Fila 2
  const fixedDiscIdeal = [31, 32, 33, 34].map(i => extractNumber(idealRow[i]));

  // VELNA Ideal: Columnas 36, 37, 38, 39, 40 de la Fila 2
  const fixedVelnaIdeal = [36, 37, 38, 39, 40].map(i => extractNumber(idealRow[i]));

  // Competencias Ideal: Asumimos que siguen en 24-30 de la Fila 2
  const fixedCompIdeal = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(idealRow[i]));

  // Etiquetas de Competencias (Fila 1)
  const compLabels = [24, 25, 26, 27, 28, 29, 30].map(
    i => String(headerRow[i] || `Comp ${i - 23}`)
  );

  // --- PROCESAMIENTO DE EMPLEADOS ---
  // Los empleados empiezan desde la Fila 3 (índice 2) hacia abajo
  const peopleRows = rows.slice(2);
  const profiles: ProfileData[] = [];

  peopleRows.forEach((personRow) => {
    const nombrePersona = personRow[1];
    
    // Si no hay nombre, saltamos la fila (puede estar vacía)
    if (!nombrePersona) return; 

    // Datos DISC Persona (Cols 8-11)
    const discPersona = [8, 9, 10, 11].map(i => extractNumber(personRow[i]));
    
    // Datos VELNA Persona (Cols 12-16)
    const velnaPersona = [12, 13, 14, 15, 16].map(i => extractNumber(personRow[i]));
    
    // Datos Competencias Persona (Cols 24-30)
    const compPersona = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(personRow[i]));

    // Porcentajes de Match del Reporte (Cols 20 y 21)
    const discMatch = extractNumber(personRow[20]);
    const velnaMatch = extractNumber(personRow[21]);

    profiles.push({
      nombrePersona: String(nombrePersona),
      discPersona,
      discIdeal: fixedDiscIdeal,   // Usamos el ideal extraído de la Fila 2
      velnaPersona,
      velnaIdeal: fixedVelnaIdeal, // Usamos el ideal extraído de la Fila 2
      compLabels,
      compPersona,
      compIdeal: fixedCompIdeal,   // Usamos el ideal extraído de la Fila 2
      discMatch,
      velnaMatch,
    });
  });

  if (profiles.length === 0) {
    throw new Error('No se encontraron perfiles de personas válidos a partir de la fila 3.');
  }

  return profiles;
}

// Calculadora fallback para competencias (ya que esas no traen match en CSV)
export function calculateMatch(persona: number[], ideal: number[]): number {
  if (!persona.length || !ideal.length) return 0;

  const total = persona.reduce((acc, p, i) => {
    const idealVal = ideal[i];
    if (idealVal === 0) return acc + 1;
    if (p >= idealVal) return acc + 1;
    return acc + p / idealVal;
  }, 0);

  return (total / persona.length) * 100;
}

export function getMatchColor(match: number): string {
  if (match >= 80) return 'text-success';
  if (match >= 60) return 'text-warning';
  return 'text-destructive';
}