import { expect, test } from "@playwright/test";

import { casaMalvaConfig } from "../config/sites/casa-malva";
import { getGoogleVisibilityViaSerpApi } from "../src/search/serpapi-google";

test("records error after two failed SerpApi requests", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.SERPAPI_API_KEY;

  let attempts = 0;

  try {
    process.env.SERPAPI_API_KEY = "mock-test-key";

    globalThis.fetch = async () => {
      attempts += 1;
      throw new DOMException(
        "The operation was aborted due to timeout",
        "TimeoutError",
      );
    };

    const keyword = casaMalvaConfig.keywords[0];

    const result = await getGoogleVisibilityViaSerpApi(
      casaMalvaConfig,
      keyword,
    );

    expect(attempts).toBe(2);
    expect(result.status).toBe("error");
    expect(result.found).toBe(false);
    expect(result.position).toBeNull();
    expect(result.pagesReviewed).toBe(0);
    expect(result.resultsReviewed).toBe(0);
  } finally {
    globalThis.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.SERPAPI_API_KEY;
    } else {
      process.env.SERPAPI_API_KEY = originalApiKey;
    }
  }
});

test("preserves partial results when SerpApi fails on page 3", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.SERPAPI_API_KEY;

  const requestedPages: number[] = [];

  try {
    process.env.SERPAPI_API_KEY = "mock-test-key";

    globalThis.fetch = async (input) => {
      const url = new URL(input.toString());
      const start = Number(url.searchParams.get("start"));

      requestedPages.push(start);

      if (start === 20) {
        throw new DOMException("Simulated SerpApi timeout", "TimeoutError");
      }

      const organicResults = Array.from({ length: 10 }, (_, index) => ({
        position: start + index + 1,
        title: `Hotel de prueba ${start + index + 1}`,
        link: `https://example.org/hotel-${start + index + 1}`,
      }));

      return new Response(
        JSON.stringify({
          organic_results: organicResults,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    };

    const result = await getGoogleVisibilityViaSerpApi(
      casaMalvaConfig,
      casaMalvaConfig.keywords[0],
    );

    expect(requestedPages).toEqual([0, 10, 20, 20]);

    expect(result.status).toBe("error");
    expect(result.found).toBe(false);
    expect(result.position).toBeNull();

    expect(result.pagesReviewed).toBe(2);
    expect(result.resultsReviewed).toBe(20);
    expect(result.searchLimit).toBe(50);
  } finally {
    globalThis.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.SERPAPI_API_KEY;
    } else {
      process.env.SERPAPI_API_KEY = originalApiKey;
    }
  }
});
