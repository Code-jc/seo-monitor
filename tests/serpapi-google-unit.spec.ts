import { expect, test } from '@playwright/test';
import { casaMalvaConfig } from '../config/sites/casa-malva';
import { getGoogleVisibilityViaSerpApi } from '../src/search/serpapi-google';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

interface OrganicResult {
  position?: number;
  link?: string;
  title?: string;
}

test.describe('SerpApi simulated responses', () => {
  test.describe.configure({ mode: 'serial' });

  async function simulate(pages: OrganicResult[][], maxPosition?: number) {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.SERPAPI_API_KEY;
    const starts: number[] = [];

    process.env.SERPAPI_API_KEY = 'test-key';

    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      const start = Number(url.searchParams.get('start'));

      starts.push(start);

      return new Response(
        JSON.stringify({
          organic_results: pages[start / 10] ?? [],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    };

    try {
      const result = await getGoogleVisibilityViaSerpApi(casaMalvaConfig, {
        ...casaMalvaConfig.keywords[0],
        maxPosition,
      });

      return { result, starts };
    } finally {
      globalThis.fetch = originalFetch;

      if (originalKey === undefined) {
        delete process.env.SERPAPI_API_KEY;
      } else {
        process.env.SERPAPI_API_KEY = originalKey;
      }
    }
  }

  test('Empty first page is an error', async () => {
    const { result, starts } = await simulate([[]]);

    expect(result.status).toBe('error');
    expect(result.found).toBe(false);
    expect(result.position).toBeNull();
    expect(result.resultsReviewed).toBe(0);
    expect(result.pagesReviewed).toBe(0);
    expect(starts).toEqual([0]);
  });

  test('Mark opaque Google redirects as unresolved', async () => {
  const { result } = await simulate(
    [
      [
        {
          position: 1,
          link: 'https://www.google.com/goto?url=CAES123',
          title: 'Hotel Casa Malva',
        },
        {
          position: 2,
          link: 'https://example.com/hotel',
        },
      ],
      [],
    ],
    20,
  );

  expect(result.status).toBe('unresolved');
  expect(result.found).toBe(false);
  expect(result.position).toBeNull();
  expect(result.matchedUrl).toBeNull();
});

  test('Count unique URLs across consulted pages', async () => {
    const { result, starts } = await simulate([
      [{ link: 'https://example.com/a' }, { link: 'https://example.com/b' }],
      [{ link: 'https://example.com/b' }, { link: 'https://example.com/c' }],
      [],
    ]);

    expect(result.status).toBe('not_found');
    expect(result.resultsReviewed).toBe(3);
    expect(result.pagesReviewed).toBe(2);
    expect(result.searchLimit).toBe(50);
    expect(starts).toEqual([0, 10, 20]);
  });

  test('Stop pagination when the target is found', async () => {
    const { result, starts } = await simulate([
      [{ link: 'https://example.com/a' }],
      [
        {
          position: 2,
          link: casaMalvaConfig.baseUrl,
          title: 'Hotel Casa Malva',
        },
      ],
    ]);

    expect(result.status).toBe('success');
    expect(result.position).toBe(12);
    expect(result.resultPage).toBe(2);
    expect(result.pagesReviewed).toBe(2);
    expect(result.searchUrl).toBeNull();
    expect(starts).toEqual([0, 10]);
  });

  test('Handle absolute position on second page', async () => {
    const { result, starts } = await simulate([
      [{ link: 'https://example.com/a' }],
      [
        {
          position: 12,
          link: casaMalvaConfig.baseUrl,
          title: 'Hotel Casa Malva',
        },
      ],
    ]);

    expect(result.status).toBe('success');
    expect(result.position).toBe(12);
    expect(result.resultPage).toBe(2);
    expect(starts).toEqual([0, 10]);
  });

  test('Respect maxPosition and stop after two pages', async () => {
    const { result, starts } = await simulate(
      [
        [{ link: 'https://example.com/a' }],
        [{ link: 'https://example.com/b' }],
        [{ link: casaMalvaConfig.baseUrl }],
      ],
      20,
    );

    expect(result.status).toBe('not_found');
    expect(result.found).toBe(false);
    expect(result.searchLimit).toBe(20);
    expect(result.pagesReviewed).toBe(2);
    expect(starts).toEqual([0, 10]);
  });

  test('Detect domain page without matching homepage', async () => {
  const { result, starts } = await simulate(
    [
      [
        {
          position: 6,
          link: 'https://hotelcasamalvagto.com/suite-king/',
          title: 'Suite King',
        },
      ],
      [
        {
          position: 2,
          link: 'https://example.com/hotel',
        },
      ],
    ],
    20,
  );

  expect(result.status).toBe('not_found');
  expect(result.found).toBe(false);
  expect(result.matchedUrl).toBeNull();

  expect(result.domainMatchedUrl).toBe(
    'https://hotelcasamalvagto.com/suite-king/',
  );
  expect(result.domainMatchedPosition).toBe(6);

  expect(starts).toEqual([0, 10]);
});

  test('Accept www but exclude staging from domain diagnostic', async () => {
  const { result } = await simulate(
    [
      [
        {
          position: 1,
          link: 'https://staging.hotelcasamalvagto.com/suite-king/',
        },
        {
          position: 2,
          link: 'https://www.hotelcasamalvagto.com/suite-king/',
        },
      ],
    ],
    10,
  );

  expect(result.status).toBe('not_found');
  expect(result.domainMatchedUrl).toBe(
    'https://www.hotelcasamalvagto.com/suite-king/',
  );
  expect(result.domainMatchedPosition).toBe(2);
});

test('Ignore malformed URL and continue detecting domain', async () => {
  const { result, starts } = await simulate(
    [
      [
        {
          position: 1,
          link: 'not-a-valid-url',
        },
        {
          position: 2,
          link: 'https://hotelcasamalvagto.com/suite-king/',
        },
      ],
    ],
    10,
  );

  expect(result.status).toBe('not_found');
  expect(result.domainMatchedUrl).toBe(
    'https://hotelcasamalvagto.com/suite-king/',
  );
  expect(result.domainMatchedPosition).toBe(2);
  expect(starts).toEqual([0]);
});

test('Do not count staging homepage as official homepage', async () => {
  const { result, starts } = await simulate(
    [
      [
        {
          position: 1,
          link: 'https://staging.hotelcasamalvagto.com/',
          title: 'Casa Malva Staging',
        },
      ],
    ],
    10,
  );

  expect(result.status).toBe('not_found');
  expect(result.found).toBe(false);
  expect(result.matchedUrl).toBeNull();
  expect(result.domainMatchedUrl).toBeNull();
  expect(starts).toEqual([0]);
});

test('Save complete SerpApi response', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.SERPAPI_API_KEY;

  process.env.SERPAPI_API_KEY = 'test-key';

  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        search_metadata: {
          status: 'Success',
        },
        search_parameters: {
          api_key: 'test-key',
          q: 'casa malva',
        },
        local_results: {
          places: [
            {
              title: 'Hotel Casa Malva Guanajuato',
              position: 1,
            },
          ],
        },
        organic_results: [
          {
            position: 1,
            title: 'Hotel Casa Malva',
            link: 'https://hotelcasamalvagto.com/',
          },
        ],
      }),
      { status: 200 },
    );
  };

  try {
  const directory = path.join(
    process.cwd(),
    'data',
    'serpapi-raw',
    'casa-malva',
  );

  const before = new Set(await readdir(directory));

  await getGoogleVisibilityViaSerpApi(
    casaMalvaConfig,
    casaMalvaConfig.keywords[0],
  );

  const after = await readdir(directory);

  const newFiles = after.filter(
    (filename) => !before.has(filename),
  );

  expect(newFiles).toHaveLength(1);

  const content = await readFile(
    path.join(directory, newFiles[0]),
    'utf8',
  );

  const saved = JSON.parse(content);

  expect(saved.organic_results).toHaveLength(1);
  expect(saved.local_results.places).toHaveLength(1);
  expect(saved.search_metadata.status).toBe('Success');

  expect(saved.search_parameters.q).toBe('casa malva');
  expect(saved.search_parameters).not.toHaveProperty('api_key');

  expect(content).not.toContain('test-key');
} finally {
    globalThis.fetch = originalFetch;

    if (originalKey === undefined) {
      delete process.env.SERPAPI_API_KEY;
    } else {
      process.env.SERPAPI_API_KEY = originalKey;
    }
  }
});
});
