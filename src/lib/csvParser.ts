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
  const text = String(value).trim();
  
  const match = text.match(/-?\d+([.,]\d+)?/);
  
  if (match) {
    const normalized = match[0].replace(',', '.');
    return parseFloat(normalized);
  }
  return 0;
}

export function parseFile(data: ArrayBuffer | string): ProfileData[] {
  const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'string' : 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Leemos todo como matriz
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  // Validamos que existan al menos 3 filas (0, 1, 2)
  if (rows.length < 3) {
    throw new Error('El archivo debe tener al menos 3 filas (Encabezados, Ideal, Primer Empleado)');
  }

  // --- REFERENCIAS DE FILAS (POR ÍNDICE) ---
  const headerRow = rows[0];      // Índice 0: Encabezados
  const compIdealRow = rows[1];   // Índice 1: Contiene el Ideal de Competencias
  const discVelnaIdealSource = rows[2]; // Índice 2: Contiene los Ideales DISC y VELNA

  // --- EXTRACCIÓN DE PERFILES IDEALES (FIJOS) ---
  
  // 1. Ideal Competencias: Viene de la Fila 1 (Índice 1), columnas 24-30
  const fixedCompIdeal = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(compIdealRow[i]));

  // 2. Ideal DISC: Viene de la Fila 2 (Índice 2), columnas 31-34
  const fixedDiscIdeal = [31, 32, 33, 34].map(i => extractNumber(discVelnaIdealSource[i]));

  // 3. Ideal VELNA: Viene de la Fila 2 (Índice 2), columnas 36-40
  const fixedVelnaIdeal = [36, 37, 38, 39, 40].map(i => extractNumber(discVelnaIdealSource[i]));

  // Etiquetas (Headers)
  const compLabels = [24, 25, 26, 27, 28, 29, 30].map(
    i => String(headerRow[i] || `Comp ${i - 23}`)
  );

  // --- PROCESAMIENTO DE EMPLEADOS ---
  // Iteramos desde la fila 2 (Índice 2) hacia abajo
  const peopleRows = rows.slice(2);
  const profiles: ProfileData[] = [];

  peopleRows.forEach((personRow) => {
    const nombrePersona = personRow[1];
    if (!nombrePersona) return; // Saltar si no hay nombre

    // Datos Persona
    const discPersona = [8, 9, 10, 11].map(i => extractNumber(personRow[i]));
    const velnaPersona = [12, 13, 14, 15, 16].map(i => extractNumber(personRow[i]));
    const compPersona = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(personRow[i]));

    // Porcentajes Match
    const discMatch = extractNumber(personRow[20]);
    const velnaMatch = extractNumber(personRow[21]);

    profiles.push({
      nombrePersona: String(nombrePersona),
      discPersona,
      discIdeal: fixedDiscIdeal,   // Usamos el extraído de la Fila 2
      velnaPersona,
      velnaIdeal: fixedVelnaIdeal, // Usamos el extraído de la Fila 2
      compLabels,
      compPersona,
      compIdeal: fixedCompIdeal,   // Usamos el extraído de la Fila 1
      discMatch,
      velnaMatch,
    });
  });

  if (profiles.length === 0) {
    throw new Error('No se encontraron perfiles válidos a partir de la fila 2');
  }

  return profiles;
}

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