import type { Page } from "@playwright/test";

export interface SearchResultCandidate {
    title: string;
    url: string;
}

export async function extractGoogleResults(
    page: Page
): Promise<SearchResultCandidate[]> {
    return page.locator('a:has(h3)').evaluateAll((links) => {
        return links.flatMap((link) => {
            const title = link.querySelector('h3')?.textContent?.trim();
            const href = link.getAttribute('href');

            if (!title || !href) {
                return [];
            }

            const url = new URL(href, document.baseURI);

            if (!['http:', 'https:'].includes(url.protocol)) {
                return [];
            }

            return [{ title, url: url.href }];

        });
    });

}