export type SearchQueryCategory = 'brand' | 'commercial' | 'review';

export function classifySearchQuery(query: string): SearchQueryCategory {
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // Consultas que mencionan la marca
  if (
    normalized.includes('casa malva') ||
    normalized.includes('hotel malva') ||
    normalized.includes('malva hotel')
  ) {
    return 'brand';
  }

  // Consultas con intención de alojamiento
  if (
    /\b(hotel|hoteles|hospedaje|alojamiento|hostal|hostales)\b/.test(normalized)
  ) {
    return 'commercial';
  }

  // Consultas que requieren revisión manual
  return 'review';
}
