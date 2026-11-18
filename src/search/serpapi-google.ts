import 'dotenv/config';

import type { MonitoredKeyword, SiteConfig } from '../types/site-config';

import type {
  SearchTarget,
  VisibilityResult,
} from '../types/search-visibility';

import { matchesTarget } from './matches-target';

import { mkdir, writeFile } from 'node:fs/promises';

import path from 'node:path';

interface SerpApiOrganicResult {
  position?: number;
  title?: string;
  link?: string;
}

interface SerpApiResponse {
  organic_results?: SerpApiOrganicResult[];
  error?: string;
  search_parameters?: Record<string, unknown>;
}

const RESULTS_PER_PAGE = 10;
const DEFAULT_MAX_POSITION = 50;


async function saveSerpApiResponse(
  keyword: MonitoredKeyword,
  start: number,
  data: SerpApiResponse,
): Promise<void> {
  const directory = path.join(
    process.cwd(),
    'data',
    'serpapi-raw',
    'casa-malva',
  );

  await mkdir(directory, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const safeKeyword = keyword.query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename = `${timestamp}_${safeKeyword}_start-${start}.json`;

  const { search_parameters, ...rest } = data;

  const sanitizedData = {
    ...rest,
    search_parameters: search_parameters
      ? Object.fromEntries(
          Object.entries(search_parameters).filter(
            ([key]) => key !== 'api_key',
          ),
        )
      : undefined,
  };
  const json = JSON.stringify(
    sanitizedData,
    (key, value) => {
      if (/^(api_key|api[-_]?token|authorization)$/i.test(key)) {
        return undefined;
      }

      if (typeof value === 'string') {
        return value.replace(
          /([?&](?:api_key|api_token|access_token)=)[^&#\s]+/gi,
          '$1[REDACTED]',
        );
      }

      return value;
    },
    2,
  );

  await writeFile(
    path.join(directory, filename),
    json,
    'utf8',
  );

}

async function fetchSerpPage(
  keyword: MonitoredKeyword,
  start: number,
): Promise<SerpApiOrganicResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is not configured.');
  }

  const searchUrl = new URL('https://serpapi.com/search.json');

  searchUrl.searchParams.set('engine', 'google');

  searchUrl.searchParams.set('q', keyword.query);

  searchUrl.searchParams.set('hl', keyword.language ?? 'es');

  searchUrl.searchParams.set('gl', (keyword.country ?? 'MX').toLowerCase());

  searchUrl.searchParams.set('device', keyword.device ?? 'desktop');

  if (keyword.location) {
    searchUrl.searchParams.set('location', keyword.location);
  }

  searchUrl.searchParams.set('num', String(RESULTS_PER_PAGE));

  searchUrl.searchParams.set('start', String(start));

  searchUrl.searchParams.set('no_cache', 'true');

  searchUrl.searchParams.set('api_key', apiKey);

  const response = await fetch(searchUrl.toString(), {
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`SerpApi HTTP error: ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResponse;


  if (data.error) {
    throw new Error(`SerpApi error: ${data.error}`);
  }

  await saveSerpApiResponse(keyword, start, data);

  return data.organic_results ?? [];
}

export async function getGoogleVisibilityViaSerpApi(
  site: SiteConfig,
  keyword: MonitoredKeyword,
): Promise<VisibilityResult> {
  const maxPosition = keyword.maxPosition ?? DEFAULT_MAX_POSITION;

  if (
    !Number.isInteger(maxPosition) ||
    maxPosition < RESULTS_PER_PAGE ||
    maxPosition > DEFAULT_MAX_POSITION ||
    maxPosition % RESULTS_PER_PAGE !== 0
  ) {
    throw new Error('maxPosition must be a multiple of 10 between 10 and 50.');
  }

  const websiteTarget: SearchTarget = {
    id: 'website',
    type: 'website',
    domain: new URL(site.baseUrl).hostname,
  };

  const expectedPath =
    new URL(keyword.targetPath, site.baseUrl).pathname.replace(/\/+$/, '') ||
    '/';

  let matchedResult: SerpApiOrganicResult | undefined;

  let matchedPosition: number | null = null;
  let matchedPage: number | null = null;
  let domainMatchedUrl: string | null = null;
  let domainMatchedPosition: number | null = null;

  const reviewedUrls = new Set<string>();
  let pagesReviewed = 0;
  let requestFailed = false;
  let hasOpaqueRedirects = false;

  for (let start = 0; start < maxPosition; start += RESULTS_PER_PAGE) {
    let organicResults: SerpApiOrganicResult[];

    try {
      organicResults = await fetchSerpPage(keyword, start);
    } catch (firstError) {
      console.warn(
        `SerpApi failed at page ${start / RESULTS_PER_PAGE + 1}. Retrying...`,
        firstError,
      );

      try {
        organicResults = await fetchSerpPage(keyword, start);
      } catch (secondError) {
        console.error(
          `SerpApi failed twice for "${keyword.query}" ` +
            `at page ${start / RESULTS_PER_PAGE + 1}:`,
          secondError,
        );

        requestFailed = true;
        break;
      }
    }

    console.log(
      `SerpApi page ${start / RESULTS_PER_PAGE + 1}:`,
      organicResults.length,
      'organic results',
    );

    if (organicResults.length === 0) {
      console.log('No more organic results. Stopping pagination.');

      break;
    }

    pagesReviewed += 1;

    for (const [index, result] of organicResults.entries()) {
  if (!result.link) {
    continue;
  }

  reviewedUrls.add(result.link);

  try {
  const resultUrl = new URL(result.link);

  if (
    (resultUrl.hostname === 'www.google.com' ||
      resultUrl.hostname === 'google.com') &&
    resultUrl.pathname === '/goto'
  ) {
    hasOpaqueRedirects = true;
  }
} catch {
  // Invalid URLs are handled by the existing validation.
}

  // Exclude staging and other subdomains.
 let hostname: string;

try {
  hostname = new URL(result.link).hostname.toLowerCase();
} catch {
  continue;
}

const domain = websiteTarget.domain.toLowerCase();

if (
  domainMatchedUrl === null &&
  (hostname === domain || hostname === `www.${domain}`)
) {
    domainMatchedUrl = result.link;

    const apiPosition = result.position;

    domainMatchedPosition =
      apiPosition !== undefined && apiPosition > start
        ? apiPosition
        : start + (apiPosition ?? index + 1);
  }
}

    const matchedIndex = organicResults.findIndex((result) => {
  if (!result.link || !matchesTarget(result.link, websiteTarget)) {
    return false;
  }

  try {
    const hostname = new URL(result.link).hostname.toLowerCase();
    const domain = websiteTarget.domain.toLowerCase();

    if (hostname !== domain && hostname !== `www.${domain}`) {
      return false;
    }

    const resultPath =
      new URL(result.link).pathname.replace(/\/+$/, '') || '/';

    return resultPath === expectedPath;
  } catch {
    return false;
  }
});

    if (matchedIndex >= 0) {
      matchedResult = organicResults[matchedIndex];

      const apiPosition = matchedResult.position;

      if (apiPosition !== undefined && apiPosition > start) {
        matchedPosition = apiPosition;
      } else {
        matchedPosition = start + (apiPosition ?? matchedIndex + 1);
      }

      matchedPage = Math.ceil(matchedPosition / 10);

      break;
    }
  }

  return {
    siteId: site.id,
    provider: 'google',

    query: keyword.query,
    country: keyword.country ?? 'MX',
    language: keyword.language ?? 'es',
    device: keyword.device ?? 'desktop',

    targetId: websiteTarget.id,
    targetType: websiteTarget.type,

    status: matchedResult
  ? 'success'
  : requestFailed || reviewedUrls.size === 0
    ? 'error'
    : hasOpaqueRedirects
      ? 'unresolved'
      : 'not_found',

    found: Boolean(matchedResult),

    position: matchedPosition,

    resultPage: matchedPage,

    matchedUrl: matchedResult?.link ?? null,

    matchedTitle: matchedResult?.title ?? null,
    domainMatchedUrl,
    domainMatchedPosition,

    resultsReviewed: reviewedUrls.size,
    pagesReviewed,
    searchLimit: maxPosition,

    /*
     * Deliberately null.
     * Never persist a SerpApi URL because it
     * contains the private API key.
     */
    searchUrl: null,

    checkedAt: new Date().toISOString(),

    runId: crypto.randomUUID(),
  };
}
