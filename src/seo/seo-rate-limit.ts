import fs from 'node:fs';
import path from 'node:path';

const STATE_DIR = path.resolve(process.cwd(), '.seo-runtime');

function getStateFile(siteId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) {
    throw new Error(`Invalid SEO site ID: ${siteId}`);
  }

  return path.join(STATE_DIR, siteId, 'rate-limit.json');
}

interface RateLimitState {
  blockedUntil: number;
  reason: 'HTTP 429';
  url: string;
}

export function getBlockedUntil(siteId: string): number {
  const stateFile = getStateFile(siteId);
  try {
    const content = fs.readFileSync(stateFile, 'utf8');
    const state = JSON.parse(content) as RateLimitState;

    if (
      typeof state.blockedUntil !== 'number' ||
      !Number.isFinite(state.blockedUntil)
    ) {
      return 0;
    }

    if (Date.now() >= state.blockedUntil) {
      return 0;
    }

    return state.blockedUntil;
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return 0;
    }

    throw error;
  }
}

export function saveRateLimit(
  siteId: string,
  url: string,
  retryAfter: string,
): number {
  const stateFile = getStateFile(siteId);
  const seconds = Number(retryAfter);

  const retryAt = Number.isFinite(seconds)
    ? Date.now() + Math.max(0, seconds) * 1000
    : Date.parse(retryAfter);

  const requestedUntil = Number.isFinite(retryAt)
    ? retryAt
    : Date.now() + 3_600_000;

  const blockedUntil = Math.max(
    getBlockedUntil(siteId),
    requestedUntil
  );

  fs.mkdirSync(path.dirname(stateFile), { recursive: true });

  const temporaryFile = `${stateFile}.${process.pid}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(
      {
        blockedUntil,
        reason: 'HTTP 429',
        url,
      } satisfies RateLimitState,
      null,
      2
    ),
    'utf8'
  );

  fs.renameSync(temporaryFile, stateFile);

  return blockedUntil;
}


export function registerRateLimit(
  siteId: string,
  url: string,
  retryAfter: string,
): number {
  const blockedUntil = saveRateLimit(
    siteId,
    url,
    retryAfter,
  );

  console.warn(
    `[BLOCKED] ${url} | Retry-After: ${retryAfter} | Until: ${new Date(blockedUntil).toISOString()}`,
  );

  return blockedUntil;
}
