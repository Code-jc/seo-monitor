import { expect, test } from '@playwright/test';

import { casaMalvaConfig } from '../config/sites/casa-malva';

import { saveTechnicalSeoResult } from '../src/storage/save-technical-seo-result';

import type { TechnicalSeoCheck } from '../src/types/technical-seo';

import { extractPageSeo } from '../src/seo/extract-page-seo';

test.describe(`SEO Audit: ${casaMalvaConfig.name}`, () => {
  test('technical SEO baseline', async ({ page, request }) => {
    const monitoredPage = casaMalvaConfig.pages[0];

    if (!monitoredPage) {
      throw new Error('No monitored page configured.');
    }

    const url = new URL(monitoredPage.path, casaMalvaConfig.baseUrl).toString();

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });

    /*
     * HTTP
     */
    const httpStatus = response?.status() ?? null;

    const httpPassed = httpStatus !== null && httpStatus < 400;

    expect
      .soft(httpPassed, `Unexpected HTTP status for ${url}: ${httpStatus}`)
      .toBe(true);

    /*
     * Title
     */
    const actualTitle = await page.title();

    const titlePassed = monitoredPage.expectedTitle
      ? actualTitle === monitoredPage.expectedTitle
      : true;

    expect.soft(titlePassed, `Unexpected title for ${url}`).toBe(true);

    /*
     * H1
     */
    const h1 = page.locator('h1').first();

    const h1Visible = await h1.isVisible().catch(() => false);

    const actualH1 = h1Visible ? ((await h1.textContent())?.trim() ?? '') : '';

    const h1Passed = monitoredPage.expectedH1
      ? h1Visible && actualH1 === monitoredPage.expectedH1
      : h1Visible;

    expect.soft(h1Passed, `Unexpected H1 for ${url}`).toBe(true);

    /*
     * Canonical
     */
    const canonical = page.locator('link[rel="canonical"]');

    const canonicalUrl = await canonical
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
      .getAttribute('content')
      .catch(() => null);

    const robots = robotsContent?.toLowerCase() ?? '';

    const hasNoIndex = robots.includes('noindex');

    const shouldBeIndexable: boolean | undefined =
      monitoredPage.shouldBeIndexable;

    const indexabilityPassed =
      shouldBeIndexable === undefined
        ? true
        : shouldBeIndexable
          ? !hasNoIndex
          : hasNoIndex;
    expect
      .soft(
        indexabilityPassed,
        `Indexability does not match configuration for ${url}`,
      )
      .toBe(true);

    /*
     * robots.txt
     */
    const robotsUrl = new URL(
      '/robots.txt',
      casaMalvaConfig.baseUrl,
    ).toString();

    const robotsResponse = await request.get(robotsUrl);

    const robotsPassed = robotsResponse.status() < 400;

    expect
      .soft(robotsPassed, `robots.txt returned ${robotsResponse.status()}`)
      .toBe(true);

    /*
     * Sitemap
     */
    const sitemapUrl = new URL(
      '/sitemap_index.xml',
      casaMalvaConfig.baseUrl,
    ).toString();

    let sitemapResponse = await request.get(sitemapUrl, { timeout: 20_000 });

    if (sitemapResponse.status() === 429) {
      const retryAfter = sitemapResponse
        .headersArray()
        .find((header) => header.name.toLowerCase() === 'retry-after')?.value;

      let waitMs = 15_000;

      if (retryAfter) {
        waitMs = /^\d+$/.test(retryAfter)
          ? Number(retryAfter) * 1_000
          : Date.parse(retryAfter) - Date.now();
      }

      console.log('Sitemap rate limit:', {
        retryAfter: retryAfter ?? null,
        waitMs,
      });

      // Si exige más de 30 segundos, conservamos el fallo.
      if (Number.isFinite(waitMs) && waitMs <= 30_000) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(1_000, waitMs)),
        );

        sitemapResponse = await request.get(sitemapUrl, { timeout: 20_000 });
      }
    }

    const sitemapPassed = sitemapResponse.status() < 400;

    const sitemapBlocked = sitemapResponse.status() === 429;

    if (sitemapBlocked) {
      console.warn(
        `Sitemap BLOCKED (429). Retry-After: ${
          sitemapResponse.headers()['retry-after'] ?? 'unknown'
        }`,
      );
    }

    expect
      .soft(
        sitemapPassed,
        `Sitemap unavailable: HTTP ${sitemapResponse.status()}`,
      )
      .toBe(true);

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
      },
      {
        id: 'sitemap',
        label: 'Sitemap XML',
        passed: sitemapPassed,
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
    });
  });
});

test.describe('SEO Audit: individual pages', () => {
  for (const monitoredPage of casaMalvaConfig.pages) {
    test(`${monitoredPage.name} - SEO validation`, async ({ request }) => {
      const url = new URL(
        monitoredPage.path,
        casaMalvaConfig.baseUrl,
      ).toString();

      const response = await request.get(url, {
        failOnStatusCode: false,
        maxRetries: 0,
      });

      const status = response.status();

      if (status === 429) {
        const retryAfter = response.headers()['retry-after'] ?? 'unknown';

        throw new Error(
          `SEO audit BLOCKED: HTTP 429 | ${url} | Retry-After: ${retryAfter}`,
        );
      }

      expect(status, `Invalid HTTP status: ${url}`).toBe(200);

      const seo = extractPageSeo(
        await response.text(),
        url,
        status,
        response.headers(),
      );

      // Title
      expect.soft(seo.title, `Empty title: ${url}`).not.toBe('');

      if (monitoredPage.expectedTitle) {
        expect
          .soft(seo.title, `Unexpected title: ${url}`)
          .toBe(monitoredPage.expectedTitle);
      }

      // H1
      expect.soft(seo.h1Count, `Expected one H1: ${url}`).toBe(1);
      expect.soft(seo.h1, `Empty H1: ${url}`).not.toBe('');

      if (monitoredPage.expectedH1) {
        expect
          .soft(seo.h1, `Unexpected H1: ${url}`)
          .toBe(monitoredPage.expectedH1);
      }

      // Canonical
      expect.soft(seo.canonicalCount, `Canonical count: ${url}`).toBe(1);

      expect.soft(seo.canonical, `Canonical mismatch: ${url}`).toBe(url);

      // Indexability
      if (monitoredPage.shouldBeIndexable !== undefined) {
        expect
          .soft(seo.noindex, `Indexability mismatch: ${url}`)
          .toBe(!monitoredPage.shouldBeIndexable);
      }

      console.log('SEO Page Audit:', seo);
    });
  }
});
