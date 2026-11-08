import { load } from 'cheerio';

export type SeoPageResult = {
  url: string;
  status: number;
  title: string;
  h1: string;
  h1Count: number;
  canonical: string | null;
  canonicalCount: number;
  robotsMeta: string;
  xRobotsTag: string;
  noindex: boolean;
};

export function extractPageSeo(
  html: string,
  url: string,
  status: number,
  headers: Record<string, string>,
): SeoPageResult {
  const $ = load(html);

  const title = $('title').first().text().trim();

  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h1 = h1Elements.first().text().trim();

  const canonicalElements = $('link[rel~="canonical" i]');
  const canonicalCount = canonicalElements.length;

  const canonicalHref = canonicalElements.first().attr('href');

  let canonical: string | null = null;

  try {
    if (canonicalHref) {
      canonical = new URL(canonicalHref, url).href;
    }
  } catch {
    canonical = null;
  }

  const robotsMeta = $('meta[name="robots" i]').first().attr('content') ?? '';

  const xRobotsTag = headers['x-robots-tag'] ?? '';

  const robots = `${robotsMeta},${xRobotsTag}`.toLowerCase();

  const noindex = /(?:^|[,;\s])noindex(?:$|[,;\s])/i.test(robots);

  return {
    url,
    status,
    title,
    h1,
    h1Count,
    canonical,
    canonicalCount,
    robotsMeta,
    xRobotsTag,
    noindex,
  };
}
