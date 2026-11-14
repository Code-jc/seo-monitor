import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { loadSearchConsoleQueries } from '../src/search-console/load-search-console-report';

test('Load Search Console queries from CSV', () => {
  const originalDirectory = process.cwd();
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'search-console-load-'),
  );

  try {
    process.chdir(temporaryDirectory);

    const directory = path.resolve('data/search-console');
    fs.mkdirSync(directory, { recursive: true });

    const csv = [
      'Consultas principales,Últimos 3 meses Clics,3 meses anteriores Clics,Últimos 3 meses Impresiones,3 meses anteriores Impresiones,Últimos 3 meses CTR,3 meses anteriores CTR,Últimos 3 meses Posición,3 meses anteriores Posición',
      'hotel casa malva guanajuato,25,10,500,200,5%,5%,2.5,4.2',
    ].join('\n');

    fs.writeFileSync(path.join(directory, 'Consultas.csv'), csv, 'utf-8');

    const queries = loadSearchConsoleQueries();

    expect(queries).toHaveLength(1);

    expect(queries[0]).toEqual({
      query: 'hotel casa malva guanajuato',
      clicks: 25,
      previousClicks: 10,
      impressions: 500,
      previousImpressions: 200,
      ctr: 5,
      previousCtr: 5,
      position: 2.5,
      previousPosition: 4.2,
    });
  } finally {
    process.chdir(originalDirectory);

    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});
