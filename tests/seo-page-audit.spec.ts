import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';

import { casaMalvaConfig } from '../config/sites/casa-malva';
import { saveTechnicalSeoResult } from '../src/storage/save-technical-seo-result';
import type { TechnicalSeoCheck } from '../src/types/technical-seo';
import { extractPageSeo } from '../src/seo/extract-page-seo';

/*
 * Technical SEO audit configuration
 */
const REQUEST_INTERVAL_MS = 3_000;
const MAX_RETRIES = 2;
const MAX_RETRY_AFTER_MS = 60_000;
const TEST_TIMEOUT_MS = 150_000;

let lastRequestAt = 0;

let blockedUntil = 0;

class SeoRateLimitError extends Error {
  constructor(
    public readonly url: string,
    public readonly retryAfter: string,
  ) {
    super(`SEO audit BLOCKED: HTTP 429 | ${url} | Retry-After: ${retryAfter}`);
    this.name = 'SeoRateLimitError';
  }
}

function ensureNotBlocked(): void {
  if (Date.now() < blockedUntil) {
    throw new SeoRateLimitError(
      casaMalvaConfig.baseUrl,
      String(Math.ceil((blockedUntil - Date.now()) / 1000)),
    );
  }
}

function registerRateLimit(response: APIResponse, url: string): void {
  const retryAfter = response.headers()['retry-after'] ?? '3600';
  const seconds = Number(retryAfter);
  const retryAt = Number.isFinite(seconds)
    ? Date.now() + Math.max(0, seconds) * 1000
    : Date.parse(retryAfter);

  blockedUntil = Math.max(
    blockedUntil,
    Number.isFinite(retryAt) ? retryAt : Date.now() + 3_600_000,
  );

  console.warn(`[BLOCKED] ${url} | Retry-After: ${retryAfter}`);
}
// Override the global fullyParallel setting for this file.
test.describe.configure({ mode: 'serial' });

test.setTimeout(TEST_TIMEOUT_MS);

/*
 * HTTP helpers
 */
async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWithRateLimit(
  request: APIRequestContext,
  url: string,
): Promise<APIResponse> {
  ensureNotBlocked();

  const elapsed = Date.now() - lastRequestAt;

  if (elapsed < REQUEST_INTERVAL_MS) {
    await wait(REQUEST_INTERVAL_MS - elapsed);
  }

  ensureNotBlocked();
  lastRequestAt = Date.now();

  const response = await request.get(url, {
    failOnStatusCode: false,
    timeout: 20_000,
    maxRetries: 0,
  });

  if (response.status() === 429) {
    registerRateLimit(response, url);
  }

  return response;
}

function isBlocked(status: number): boolean {
  return status === 429;
}

/*
 * Technical SEO baseline
 */
test.describe(`SEO Audit: ${casaMalvaConfig.name}`, () => {
  test('technical SEO baseline', async ({ page, request }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'El baseline SEO solo se registra en Chromium',
    );

    const monitoredPage = casaMalvaConfig.pages[0];

    if (!monitoredPage) {
      throw new Error('No monitored page configured.');
    }

    const url = new URL(monitoredPage.path, casaMalvaConfig.baseUrl).toString();

    ensureNotBlocked();

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    /*
     * HTTP
     */
    const httpStatus = response?.status() ?? null;

    if (httpStatus === 429) {
      blockedUntil = Math.max(blockedUntil, Date.now() + 3_600_000);
      throw new SeoRateLimitError(
        url,
        response?.headers()['retry-after'] ?? '3600',
      );
    }

    const httpPassed = httpStatus === 200;

    expect
      .soft(httpPassed, `Unexpected HTTP status for ${url}: ${httpStatus}`)
      .toBe(true);

    /*
     * Title
     */
    const actualTitle = await page.title();

    const titlePassed = monitoredPage.expectedTitle
      ? actualTitle === monitoredPage.expectedTitle
      : actualTitle.trim().length > 0;

    expect.soft(titlePassed, `Unexpected title for ${url}`).toBe(true);

    /*
     * H1
     */
    const h1 = page.locator('h1').first();

    const h1Visible = await h1.isVisible().catch(() => false);

    const actualH1 = h1Visible ? ((await h1.textContent())?.trim() ?? '') : '';

    const h1Passed = monitoredPage.expectedH1
      ? h1Visible && actualH1 === monitoredPage.expectedH1
      : h1Visible && actualH1.length > 0;

    expect.soft(h1Passed, `Unexpected H1 for ${url}`).toBe(true);

    /*
     * Canonical
     */
    const canonicalUrl = await page
      .locator('link[rel="canonical"]')
      .first()
      .getAttribute('href')
      .catch(() => null);

    const canonicalPassed = Boolean(canonicalUrl);

    expect.soft(canonicalPassed, `Canonical tag missing for ${url}`).toBe(true);

    /*
     * Indexability
     */
    const robotsContent = await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute('content')
      .catch(() => null);

    const robots = robotsContent?.toLowerCase() ?? '';

    const hasNoIndex = robots
      .split(',')
      .some((directive) => directive.trim() === 'noindex');

    const shouldBeIndexable = monitoredPage.shouldBeIndexable;

    const indexabilityPassed =
      shouldBeIndexable === undefined
        ? true
        : shouldBeIndexable
          ? !hasNoIndex
          : hasNoIndex;

    expect
      .soft(indexabilityPassed, `Indexability mismatch for ${url}`)
      .toBe(true);

    /*
     * robots.txt
     */
    const robotsUrl = new URL(
      '/robots.txt',
      casaMalvaConfig.baseUrl,
    ).toString();

    const robotsResponse = await getWithRateLimit(request, robotsUrl);

    const robotsStatus = robotsResponse.status();

    const robotsBlocked = isBlocked(robotsStatus);

    const robotsPassed = robotsStatus >= 200 && robotsStatus < 400;

    if (!robotsBlocked) {
      expect
        .soft(robotsPassed, `robots.txt returned HTTP ${robotsStatus}`)
        .toBe(true);
    }

    /*
     * Sitemap
     */
    const sitemapUrl = new URL(
      '/sitemap_index.xml',
      casaMalvaConfig.baseUrl,
    ).toString();

    let sitemapStatus: number | null = null;
    let sitemapBlocked = false;
    let sitemapPassed = false;

    if (Date.now() < blockedUntil) {
      sitemapBlocked = true;

      console.warn(
        '[BLOCKED] Sitemap not requested: active HTTP 429 suspension',
      );
    } else {
      const sitemapResponse = await getWithRateLimit(request, sitemapUrl);

      sitemapStatus = sitemapResponse.status();
      sitemapBlocked = isBlocked(sitemapStatus);
      sitemapPassed = sitemapStatus >= 200 && sitemapStatus < 400;
    }

    if (!sitemapBlocked) {
      expect
        .soft(sitemapPassed, `Sitemap unavailable: HTTP ${sitemapStatus}`)
        .toBe(true);
    }

    /*
     * Structured result
     */
    const checks: TechnicalSeoCheck[] = [
      {
        id: 'http',
        label: 'HTTP 200',
        passed: httpPassed,
      },
      {
        id: 'title',
        label: 'Title correcto',
        passed: titlePassed,
      },
      {
        id: 'h1',
        label: 'H1 correcto',
        passed: h1Passed,
      },
      {
        id: 'canonical',
        label: 'Canonical',
        passed: canonicalPassed,
      },
      {
        id: 'indexability',
        label: 'Indexable',
        passed: indexabilityPassed,
      },
      {
        id: 'robots',
        label: 'robots.txt',
        passed: robotsPassed,
        status: robotsBlocked ? 'blocked' : robotsPassed ? 'passed' : 'failed',
      },
      {
        id: 'sitemap',
        label: 'Sitemap XML',
        passed: sitemapPassed,
        status: sitemapBlocked
          ? 'blocked'
          : sitemapPassed
            ? 'passed'
            : 'failed',
      },
    ];

    const passed = checks.filter((check) => check.passed).length;

    const result = {
      siteId: casaMalvaConfig.id,
      checkedAt: new Date().toISOString(),
      passed,
      total: checks.length,
      checks,
    };

    saveTechnicalSeoResult(result);

    console.log('Technical SEO:', result);

    console.log('SEO page baseline:', {
      page: monitoredPage.name,
      url,
      httpStatus,
      title: actualTitle,
      h1: actualH1,
      canonical: canonicalUrl,
      robotsMeta: robotsContent,
      robotsStatus,
      sitemapStatus,
    });

    /*
     * A blocked audit must not be reported as passed.
     * Save the result first, then fail the test clearly.
     */
    if (robotsBlocked || sitemapBlocked) {
      throw new Error(
        `SEO AUDIT INCOMPLETE: ${
          robotsBlocked ? `robots.txt HTTP ${robotsStatus}` : ''
        } ${sitemapBlocked ? `sitemap HTTP ${sitemapStatus}` : ''}`.trim(),
      );
    }
  });
});

/*
 * Individual page SEO validation
 */
test.describe('SEO Audit: individual pages', () => {
  for (const monitoredPage of casaMalvaConfig.pages) {
    test(`${monitoredPage.name} - SEO validation`, async ({ request }) => {
      const url = new URL(
        monitoredPage.path,
        casaMalvaConfig.baseUrl,
      ).toString();

      const response = await getWithRateLimit(request, url);

      const status = response.status();

      if (isBlocked(status)) {
        throw new Error(
          `SEO audit BLOCKED: HTTP ${status} | ${url} | Retry-After: ${
            response.headers()['retry-after'] ?? 'unknown'
          }`,
        );
      }

      expect(status, `Invalid HTTP status: ${url}`).toBe(200);

      const seo = extractPageSeo(
        await response.text(),
        url,
        status,
        response.headers(),
      );

      /*
       * Title
       */
      expect.soft(seo.title, `Empty title: ${url}`).not.toBe('');

      if (monitoredPage.expectedTitle) {
        expect
          .soft(seo.title, `Unexpected title: ${url}`)
          .toBe(monitoredPage.expectedTitle);
      }

      /*
       * H1
       */
      expect.soft(seo.h1Count, `Expected one H1: ${url}`).toBe(1);

      expect.soft(seo.h1, `Empty H1: ${url}`).not.toBe('');

      if (monitoredPage.expectedH1) {
        expect
          .soft(seo.h1, `Unexpected H1: ${url}`)
          .toBe(monitoredPage.expectedH1);
      }

      /*
       * Canonical
       */
      expect.soft(seo.canonicalCount, `Canonical count: ${url}`).toBe(1);

      expect.soft(seo.canonical, `Canonical mismatch: ${url}`).toBe(url);

      /*
       * Indexability
       */
      if (monitoredPage.shouldBeIndexable !== undefined) {
        expect
          .soft(seo.noindex, `Indexability mismatch: ${url}`)
          .toBe(!monitoredPage.shouldBeIndexable);
      }

      console.log('SEO Page Audit:', seo);
    });
  }
});
