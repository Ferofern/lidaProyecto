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
  const match = text.match(/-?\d+(\.\d+)?/);
  
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

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  if (rows.length < 3) {
    throw new Error('El archivo debe tener al menos 3 filas (Encabezados, Ideal, Personas)');
  }

  const headerRow = rows[0];
  const idealRow = rows[1]; // Fila 2: Contiene los Ideales

  // ✅ CORRECCIÓN: Extraer los ideales de 'idealRow', no de 'personRow'
  // DISC Ideal: Cols 31-34
  const discIdeal = [31, 32, 33, 34].map(i => extractNumber(idealRow[i]));
  
  // VELNA Ideal: Cols 36-40
  const velnaIdeal = [36, 37, 38, 39, 40].map(i => extractNumber(idealRow[i]));
  
  // Competencias Ideal: Cols 24-30
  const compIdeal = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(idealRow[i]));

  // Etiquetas de competencias
  const compLabels = [24, 25, 26, 27, 28, 29, 30].map(
    i => String(headerRow[i] || `Comp ${i - 23}`)
  );

  const peopleRows = rows.slice(2);
  const profiles: ProfileData[] = [];

  peopleRows.forEach((personRow) => {
    const nombrePersona = personRow[1];
    if (!nombrePersona) return; 

    const discPersona = [8, 9, 10, 11].map(i => extractNumber(personRow[i]));
    const velnaPersona = [12, 13, 14, 15, 16].map(i => extractNumber(personRow[i]));
    const compPersona = [24, 25, 26, 27, 28, 29, 30].map(i => extractNumber(personRow[i]));

    const discMatch = extractNumber(personRow[20]);
    const velnaMatch = extractNumber(personRow[21]);

    profiles.push({
      nombrePersona: String(nombrePersona),
      discPersona,
      discIdeal,   // ✅ Asignamos el ideal extraído arriba
      velnaPersona,
      velnaIdeal,  // ✅ Asignamos el ideal extraído arriba
      compLabels,
      compPersona,
      compIdeal,   // ✅ Asignamos el ideal extraído arriba
      discMatch,
      velnaMatch,
    });
  });

  if (profiles.length === 0) {
    throw new Error('No se encontraron perfiles válidos a partir de la fila 3');
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