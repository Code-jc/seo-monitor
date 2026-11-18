import { expect, test } from '@playwright/test';
import { renderVisibilityHtml } from '../src/reporting/render-visibility-html';
import type { VisibilityReport } from '../src/reporting/build-visibility-report';

test('Shows individual keyword search limit', () => {
  const report = {
    siteId: 'casa-malva',
    siteName: 'Casa Malva',
    keyword: 'hotel casa malva guanajuato',
    technicalSeo: null,
    baseline: {
      status: null,
      position: null,
      checkedAt: null,
    },
    latest: {
      status: 'not_found',
      position: null,
      checkedAt: '2026-11-17T12:00:00.000Z',
      searchLimit: 20,
    },
    change: {
      positionChange: null,
      statusChanged: false,
      totalMeasurements: 1,
      measurableMeasurements: 1,
    },
    keywordSummaries: [
      {
        query: 'hotel en guanajuato',
        baseline: {
          status: null,
          position: null,
          checkedAt: null,
        },
        latest: {
          status: 'not_found',
          position: null,
          checkedAt: '2026-11-17T12:00:00.000Z',
          searchLimit: 20,
        },
        positionChange: null,
        totalMeasurements: 1,
        measurableMeasurements: 1,
      },
    ],
  } satisfies VisibilityReport;

  const html = renderVisibilityHtml(report);

  expect(html).toContain('No encontrado hasta posición 20');
  expect(html).toContain('Límite de búsqueda: primeras 20 posiciones');
});