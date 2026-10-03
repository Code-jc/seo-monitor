import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { getGoogleVisibilityViaSerpApi } from "../src/search/serpapi-google";

interface OrganicResult {
    position?: number;
    link?: string;
    title?: string;
}

test.describe("SerpApi simulated responses", () => {
    test.describe.configure({ mode: "serial" });

    async function simulate(pages: OrganicResult[][]) {
        const originalFetch = globalThis.fetch;
        const originalKey = process.env.SERPAPI_API_KEY;
        const starts: number[] = [];

        process.env.SERPAPI_API_KEY = "test-key";

        globalThis.fetch = async (input) => {
            const url = new URL(String(input));
            const start = Number(url.searchParams.get("start"));

            starts.push(start);

            return new Response(
                JSON.stringify({
                    organic_results: pages[start / 10] ?? [],
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        };

        try {
            const result = await getGoogleVisibilityViaSerpApi(
                casaMalvaConfig,
                casaMalvaConfig.keywords[0]
            );

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

    test("Empty first page is an error", async () => {
        const { result, starts } = await simulate([[]]);

        expect(result.status).toBe("error");
        expect(result.found).toBe(false);
        expect(result.position).toBeNull();
        expect(result.resultsReviewed).toBe(0);
        expect(result.pagesReviewed).toBe(0);
        expect(starts).toEqual([0]);
    });

    test("Count unique URLs across consulted pages", async () => {
        const { result, starts } = await simulate([
            [
                { link: "https://example.com/a" },
                { link: "https://example.com/b" },
            ],
            [
                { link: "https://example.com/b" },
                { link: "https://example.com/c" },
            ],
            [],
        ]);

        expect(result.status).toBe("not_found");
        expect(result.resultsReviewed).toBe(3);
        expect(result.pagesReviewed).toBe(2);
        expect(result.searchLimit).toBe(50);
        expect(starts).toEqual([0, 10, 20]);
    });

    test("Stop pagination when the target is found", async () => {
        const { result, starts } = await simulate([
            [{ link: "https://example.com/a" }],
            [{
                position: 2,
                link: casaMalvaConfig.baseUrl,
                title: "Hotel Casa Malva",
            }],
        ]);

        expect(result.status).toBe("success");
        expect(result.position).toBe(12);
        expect(result.resultPage).toBe(2);
        expect(result.pagesReviewed).toBe(2);
        expect(result.searchUrl).toBeNull();
        expect(starts).toEqual([0, 10]);
    });
});