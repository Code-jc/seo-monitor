import { test, expect } from '@playwright/test';
import { extractPageSeo } from '../src/seo/extract-page-seo';

test('Extract SEO metadata from Casa Malva', async ({ request }) => {
  const url = 'https://hotelcasamalvagto.com/suite-individual/';

  const response = await request.get(url, {
    failOnStatusCode: false,
  });

  expect(response.status()).toBe(200);

  const seo = extractPageSeo(
    await response.text(),
    url,
    response.status(),
    response.headers(),
  );

  console.log('EXTRACTED SEO:', seo);

  expect(seo.title.trim()).not.toBe('');
  expect(seo.title.toLowerCase()).toContain('casa malva');

  expect(seo.h1).toBe('Habitación Individual');
  expect(seo.h1Count).toBe(1);
  expect(seo.canonical).toBe(url);
  expect(seo.canonicalCount).toBe(1);
  expect(seo.noindex).toBe(false);
});
