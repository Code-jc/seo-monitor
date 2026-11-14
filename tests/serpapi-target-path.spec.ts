import { expect, test } from '@playwright/test';
import { casaMalvaConfig } from '../config/sites/casa-malva';
import { getGoogleVisibilityViaSerpApi } from '../src/search/serpapi-google';

test('matches homepage instead of other URLs from the same domain', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.SERPAPI_API_KEY;

  process.env.SERPAPI_API_KEY = 'test-key';

  let requests = 0;

  globalThis.fetch = async () => {
    requests++;

    return new Response(
      JSON.stringify({
        organic_results: [
          {
            position: 1,
            title: 'Hello world!',
            link: 'https://hotelcasamalvagto.com/hello-world/',
          },
          {
            position: 2,
            title: 'Casa Malva - Inicio',
            link: 'https://hotelcasamalvagto.com/',
          },
        ],
      }),
      { status: 200 },
    );
  };

  try {
    const keyword = casaMalvaConfig.keywords.find(
      (item) => item.query === 'hotel casa malva guanajuato',
    );

    if (!keyword) {
      throw new Error('Keyword not configured');
    }

    const result = await getGoogleVisibilityViaSerpApi(
      casaMalvaConfig,
      keyword,
    );

    expect(result.status).toBe('success');
    expect(result.position).toBe(2);
    expect(result.resultPage).toBe(1);
    expect(result.matchedUrl).toBe('https://hotelcasamalvagto.com/');
    expect(requests).toBe(1);
  } finally {
    globalThis.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.SERPAPI_API_KEY;
    } else {
      process.env.SERPAPI_API_KEY = originalApiKey;
    }
  }
});
