import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

import {
  getBlockedUntil,
  saveRateLimit,
  registerRateLimit,
} from '../src/seo/seo-rate-limit';

const SITE_ID = 'seo-offline-test';

test.afterEach(() => {
  const stateFile = path.resolve(
    process.cwd(),
    '.seo-runtime',
    SITE_ID,
    'rate-limit.json',
  );

  fs.rmSync(stateFile, { force: true });
});

test('HTTP 429 saves a persistent rate limit', async () => {
 
    const blockedUntil = saveRateLimit(
    SITE_ID,
    'https://example.com/robots.txt',
    '60',
  );

  expect(blockedUntil).toBeGreaterThan(Date.now());
  expect(getBlockedUntil(SITE_ID)).toBe(blockedUntil);
});


test('Local server responds with HTTP 429', async ({ request }) => {
  const server = http.createServer((_req, res) => {
    res.writeHead(429, {
      'Retry-After': '60',
    });
    res.end('Too Many Requests');
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Invalid server address');
    }

    const response = await request.get(
      `http://127.0.0.1:${address.port}`,
      { failOnStatusCode: false },
    );

    expect(response.status()).toBe(429);
    expect(response.headers()['retry-after']).toBe('60');

    const retryAfter = response.headers()['retry-after'] ?? '3600';

if (response.status() === 429) {
  registerRateLimit(
    SITE_ID,
    response.url(),
    retryAfter,
  );
}

expect(getBlockedUntil(SITE_ID)).toBeGreaterThan(Date.now());
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

