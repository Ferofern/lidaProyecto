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
  const match = text.match(/\d+(\.\d+)?/);
  
  if (!match && text.includes(',')) {
    const normalized = text.replace(',', '.');
    const matchComma = normalized.match(/\d+(\.\d+)?/);
    return matchComma ? parseFloat(matchComma[0]) : 0;
  }
  return match ? parseFloat(match[0]) : 0;
}

// ✅ Ahora devuelve un Array de ProfileData
export function parseFile(data: ArrayBuffer | string): ProfileData[] {
  const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'string' : 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // defval: '' asegura que si la celda está vacía, no rompa el array
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  if (rows.length < 3) {
    throw new Error('El archivo debe tener al menos 3 filas (Encabezados, Ideal, Personas)');
  }

  const headerRow = rows[0];
  const idealRow = rows[1]; // El perfil ideal está en la fila 1 (siempre fijo)

  // Las personas empiezan desde la fila 2 hacia abajo
  const peopleRows = rows.slice(2);

  const profiles: ProfileData[] = [];

  peopleRows.forEach((personRow) => {
    // Validación simple: Si no hay nombre en la columna 1, probablemente es una fila vacía
    const nombrePersona = personRow[1];
    if (!nombrePersona) return; 

    const discPersona = [8, 9, 10, 11].map(i => extractNumber(personRow[i]));
    const discIdeal = [31, 32, 33, 34].map(i => extractNumber(personRow[i])); // ¿El ideal varía por fila? Asumimos que sí según tu lógica original

    const velnaPersona = [12, 13, 14, 15, 16].map(i => extractNumber(personRow[i]));
    const velnaIdeal = [36, 37, 38, 39, 40].map(i => extractNumber(personRow[i]));

    const compLabels = [24, 25, 26, 27, 28, 29, 30].map(
      i => String(headerRow[i] || `Comp ${i - 23}`)
    );

    const compIdeal = [24, 25, 26, 27, 28, 29, 30].map(
      i => extractNumber(idealRow[i])
    );

    const compPersona = [24, 25, 26, 27, 28, 29, 30].map(
      i => extractNumber(personRow[i])
    );

    const discMatch = extractNumber(personRow[20]);
    const velnaMatch = extractNumber(personRow[21]);

    profiles.push({
      nombrePersona: String(nombrePersona),
      discPersona,
      discIdeal,
      velnaPersona,
      velnaIdeal,
      compLabels,
      compPersona,
      compIdeal,
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