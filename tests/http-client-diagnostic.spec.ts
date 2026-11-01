import { test } from '@playwright/test';

test('Compare Playwright HTTP response', async ({ request }) => {
  const url = 'https://hotelcasamalvagto.com/sitemap_index.xml';

  const response = await request.get(url, {
    failOnStatusCode: false,
    maxRetries: 0,
  });

  console.log('HTTP DIAGNOSTIC:', {
    url,
    status: response.status(),
    headers: response.headers(),
  });
});
