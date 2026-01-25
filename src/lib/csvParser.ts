export interface ProfileData {
  nombrePersona: string;
  discPersona: number[];
  discIdeal: number[];
  velnaPersona: number[];
  velnaIdeal: number[];
  compLabels: string[];
  compPersona: number[];
  compIdeal: number[];
}

function extractNumber(text: string): number {
  const match = text.match(/\d+(\.\d+)?/);
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
  const personRow = lines[2];

  const nombrePersona = personRow[1] || 'Persona';

  const discPersona = [8, 9, 10, 11].map(i => Number(personRow[i]) || 0);
  const discIdeal = [31, 32, 33, 34].map(i => Number(personRow[i]) || 0);

  const velnaPersona = [12, 13, 14, 15, 16].map(i => Number(personRow[i]) || 0);
  const velnaIdeal = [36, 37, 38, 39, 40].map(i => Number(personRow[i]) || 0);

  const compLabels = [24, 25, 26, 27, 28, 29].map(
    i => headerRow[i] || `Comp ${i - 23}`
  );

  const compIdeal = [24, 25, 26, 27, 28, 29].map(
    i => extractNumber(idealRow[i] || '0')
  );

  const compPersona = [24, 25, 26, 27, 28, 29].map(
    i => Number(personRow[i]) || 0
  );

  return {
    nombrePersona,
    discPersona,
    discIdeal,
    velnaPersona,
    velnaIdeal,
    compLabels,
    compPersona,
    compIdeal,
  };
}

export function calculateMatch(persona: number[], ideal: number[]): number {
  if (
    !Array.isArray(persona) ||
    !Array.isArray(ideal) ||
    persona.length === 0 ||
    ideal.length === 0 ||
    persona.length !== ideal.length
  ) {
    return 0;
  }

  let totalDiff = 0;

  for (let i = 0; i < persona.length; i++) {
    const p = persona[i];
    const idealVal = ideal[i];

    if (idealVal > 0) {
      totalDiff += Math.abs(p - idealVal) / idealVal;
    }
  }

  const avgDiff = totalDiff / persona.length;
  const match = 100 * (1 - avgDiff);

  return Math.max(0, Math.min(100, match));
}
