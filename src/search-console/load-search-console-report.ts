import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export interface SearchConsoleQuery {
  query: string;
  clicks: number;
  previousClicks: number;
  impressions: number;
  previousImpressions: number;
  ctr: number;
  previousCtr: number;
  position: number | null;
  previousPosition: number | null;
}

export function loadSearchConsoleQueries(): SearchConsoleQuery[] {
  const filePath = path.resolve('data/search-console/Consultas.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(
      'Search Console CSV not found. Continuing without Search Console data.',
    );

    return [];
  }

  const csv = fs.readFileSync(filePath, 'utf-8');

  const requiredColumns = [
    'Consultas principales',
    'Últimos 3 meses Clics',
    '3 meses anteriores Clics',
    'Últimos 3 meses Impresiones',
    '3 meses anteriores Impresiones',
    'Últimos 3 meses CTR',
    '3 meses anteriores CTR',
    'Últimos 3 meses Posición',
    '3 meses anteriores Posición',
  ];

  const rows = parse(csv, {
    columns: (headers: string[]) =>
      headers.map((header) => header.replace(/\u00A0/g, ' ').trim()),
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as Record<string, string>[];

  if (
    rows.length > 0 &&
    requiredColumns.some((column) => !(column in rows[0]))
  ) {
    throw new Error(
      `Columnas faltantes: ${requiredColumns
        .filter((column) => !(column in rows[0]))
        .map((column) => JSON.stringify(column))
        .join(', ')}`,
    );
  }

  return rows.map((row) => {
    const impressions = Number(row['Últimos 3 meses Impresiones']);
    const previousImpressions = Number(row['3 meses anteriores Impresiones']);

    return {
      query: row['Consultas principales'],
      clicks: Number(row['Últimos 3 meses Clics']),
      previousClicks: Number(row['3 meses anteriores Clics']),
      impressions,
      previousImpressions,
      ctr: Number(row['Últimos 3 meses CTR'].replace('%', '')),
      previousCtr: Number(row['3 meses anteriores CTR'].replace('%', '')),
      position:
        impressions > 0 ? Number(row['Últimos 3 meses Posición']) : null,
      previousPosition:
        previousImpressions > 0
          ? Number(row['3 meses anteriores Posición'])
          : null,
    };
  });
}
