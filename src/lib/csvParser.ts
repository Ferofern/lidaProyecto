export interface ProfileData {
  nombrePersona: string;
  discPersona: number[];
  discIdeal: number[];
  velnaPersona: number[];
  velnaIdeal: number[];
  compLabels: string[];
  compPersona: number[];
  compIdeal: number[];
  // ✅ Nuevos campos para los porcentajes oficiales del CSV
  discMatch: number;
  velnaMatch: number;
}

function extractNumber(text: string): number {
  // Busca números, permitiendo decimales con punto
  const match = text.match(/\d+(\.\d+)?/);
  // Si el CSV usa comas para decimales (ej: "80,5"), reemplazamos antes
  if (!match && text.includes(',')) {
    const normalized = text.replace(',', '.');
    const matchComma = normalized.match(/\d+(\.\d+)?/);
    return matchComma ? parseFloat(matchComma[0]) : 0;
  }
  return match ? parseFloat(match[0]) : 0;
}

export function parseCSV(content: string): ProfileData {
  const lines = content
    .split('\n')
    .map(line =>
      line.split(';').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );

  if (lines.length < 3) {
    throw new Error('El archivo CSV debe tener al menos 3 filas');
  }

  const headerRow = lines[0];
  const idealRow = lines[1];
  const personRow = lines[2]; // Fila 2 (contando desde 0)

  const nombrePersona = personRow[1] || 'Persona';

  // --- DISC ---
  const discPersona = [8, 9, 10, 11].map(i => Number(personRow[i]) || 0);
  const discIdeal = [31, 32, 33, 34].map(i => Number(personRow[i]) || 0);

  // --- VELNA ---
  const velnaPersona = [12, 13, 14, 15, 16].map(i => Number(personRow[i]) || 0);
  const velnaIdeal = [36, 37, 38, 39, 40].map(i => Number(personRow[i]) || 0);

  // --- COMPETENCIAS ---
  const compLabels = [24, 25, 26, 27, 28, 29, 30].map(
    i => headerRow[i] || `Comp ${i - 23}`
  );
  
  // Usamos extractNumber aquí por si vienen con texto
  const compIdeal = [24, 25, 26, 27, 28, 29, 30].map(
    i => extractNumber(idealRow[i] || '0')
  );

  const compPersona = [24, 25, 26, 27, 28, 29, 30].map(
    i => Number(personRow[i]) || 0
  );

  // ✅ EXTRACCIÓN DIRECTA DEL MATCH
  // Columna 20 para DISC, Columna 21 para VELNA (Fila PersonRow)
  const discMatch = extractNumber(personRow[20] || '0');
  const velnaMatch = extractNumber(personRow[21] || '0');

  return {
    nombrePersona,
    discPersona,
    discIdeal,
    velnaPersona,
    velnaIdeal,
    compLabels,
    compPersona,
    compIdeal,
    discMatch,  // <--- Valor real del CSV
    velnaMatch, // <--- Valor real del CSV
  };
}

// Mantenemos esta función por si la necesitas para 'Competencias' 
// o si el CSV viniera vacío en esas columnas.
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