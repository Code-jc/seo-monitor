import fs from 'node:fs';
import path from 'node:path';

import type { VisibilityReport } from './build-visibility-report';

import { renderVisibilityHtml } from './render-visibility-html';

import { loadTechnicalSeoResult } from '../storage/load-technical-seo-result';

import { loadVisibilityResults } from '../storage/load-visibility-results';

import { getKeywordVisibilitySummaries } from '../visibility/get-keyword-visibility-summaries';

import { loadTechnicalSeoHistory } from '../storage/load-technical-seo-history';

import { casaMalvaConfig } from '../../config/sites/casa-malva';

import { loadSearchConsoleQueries } from '../search-console/load-search-console-report';

export function writeVisibilityReport(report: VisibilityReport): string {
  const reportsDir = path.resolve('reports');

  fs.mkdirSync(reportsDir, {
    recursive: true,
  });

  const filePath = path.join(reportsDir, `${report.siteId}.html`);

  const technicalSeo =
    report.technicalSeo ?? loadTechnicalSeoResult(report.siteId);

  const visibilityResults = loadVisibilityResults(report.siteId);

  const measuredSummaries = getKeywordVisibilitySummaries(visibilityResults);

  const summariesByQuery = new Map(
    measuredSummaries.map((summary) => [summary.query, summary]),
  );

  const keywordSummaries = casaMalvaConfig.keywords.map((keyword) => {
    const existing = summariesByQuery.get(keyword.query);

    return (
      existing ?? {
        query: keyword.query,
        history: [],
        baseline: {
          status: null,
          position: null,
          checkedAt: null,
        },
        latest: {
          status: null,
          position: null,
          checkedAt: null,
        },
        latestAttempt: null,
        positionChange: null,
        totalMeasurements: 0,
        measurableMeasurements: 0,
      }
    );
  });

  const searchConsoleQueries = loadSearchConsoleQueries();

  const enrichedReport: VisibilityReport = {
    ...report,

    technicalSeo,

    technicalSeoHistory:
      report.technicalSeoHistory ?? loadTechnicalSeoHistory(report.siteId),

    keywordSummaries,

    searchConsole:
      searchConsoleQueries.length > 0
        ? {
            period: 'Últimos 3 meses',
            previousPeriod: '3 meses anteriores',

            // Todavía no tenemos totales generales verificados.
            clicks: null,
            previousClicks: null,
            impressions: null,
            previousImpressions: null,

            ctr: null,
            previousCtr: null,
            averagePosition: null,
            previousAveragePosition: null,

            queries: searchConsoleQueries,
          }
        : null,
  };

  const html = renderVisibilityHtml(enrichedReport);

  fs.writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
