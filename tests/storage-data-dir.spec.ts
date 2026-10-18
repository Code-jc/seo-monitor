import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';

import { saveVisibilityResult } from '../src/storage/save-visibility-result';
import { saveTechnicalSeoResult } from '../src/storage/save-technical-seo-result';

import type { VisibilityResult } from '../src/types/search-visibility';
import type { TechnicalSeoResult } from '../src/types/technical-seo';

test('Save SEO data under SEO_DATA_DIR', () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'seo-data-dir-'),
  );

  const originalDataDir = process.env.SEO_DATA_DIR;

  const visibilityResult: VisibilityResult = {
    siteId: 'test-site',
    provider: 'google',
    query: 'hotel de prueba',
    country: 'mx',
    language: 'es',
    device: 'desktop',
    targetId: 'website',
    targetType: 'website',
    status: 'success',
    found: true,
    position: 3,
    resultPage: 1,
    matchedUrl: 'https://example.com/',
    matchedTitle: 'Hotel de prueba',
    searchUrl: null,
    checkedAt: '2026-10-18T12:00:00Z',
    runId: 'test-run',
  };

  const technicalResult: TechnicalSeoResult = {
    siteId: 'test-site',
    checkedAt: '2026-10-18T12:00:00Z',
    passed: 1,
    total: 1,
    checks: [
      {
        id: 'robots',
        label: 'Robots.txt',
        passed: true,
      },
    ],
  };

  try {
    process.env.SEO_DATA_DIR = temporaryDirectory;

    saveVisibilityResult(visibilityResult);
    saveTechnicalSeoResult(technicalResult);

    const visibilityPath = path.join(
      temporaryDirectory,
      'visibility',
      'test-site.json',
    );

    const technicalPath = path.join(
      temporaryDirectory,
      'technical-seo',
      'test-site.json',
    );

    const historyPath = path.join(
      temporaryDirectory,
      'technical-seo',
      'test-site.history.json',
    );

    expect(fs.existsSync(visibilityPath)).toBe(true);
    expect(fs.existsSync(technicalPath)).toBe(true);
    expect(fs.existsSync(historyPath)).toBe(true);

    expect(JSON.parse(fs.readFileSync(visibilityPath, 'utf-8'))).toEqual([
      visibilityResult,
    ]);

    expect(JSON.parse(fs.readFileSync(technicalPath, 'utf-8'))).toEqual(
      technicalResult,
    );

    expect(JSON.parse(fs.readFileSync(historyPath, 'utf-8'))).toEqual([
      technicalResult,
    ]);
  } finally {
    if (originalDataDir === undefined) {
      delete process.env.SEO_DATA_DIR;
    } else {
      process.env.SEO_DATA_DIR = originalDataDir;
    }

    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});
