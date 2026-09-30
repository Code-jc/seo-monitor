import { expect, test } from "@playwright/test";
import { extractGoogleResults } from "../src/search/extract-google-results";
import { matchesTarget } from "../src/search/matches-target";
import { casaMalvaConfig } from "../config/sites/casa-malva";

test('extracts title links in document order', async ({ page }) => {
    await page.setContent(`
         <a href="https://example.com/">
            <h3>Otro hotel</h3>
        </a>
        <a href="https://hotelcasamalvagto.com/">
            <h3>Casa Malva</h3>
        </a>
        <a href="https://example.org/">Sin encabezado</a>
        <a><h3>Sin URL</h3></a>
        <a href="javascript:void(0)"><h3>Acción</h3></a>
        `);

    const results = await extractGoogleResults(page);

    expect(results).toEqual([
        {
            title: 'Otro hotel',
            url: 'https://example.com/',
        },
        {
            title: 'Casa Malva',
            url: 'https://hotelcasamalvagto.com/'
        },
    ]);

    const target = casaMalvaConfig.searchVisibility.targets[0];

    const matchedIndex = results.findIndex((result) =>
        matchesTarget(result.url, target)
    );

    expect(matchedIndex).toBe(1);

    const matchedResult = results[matchedIndex];

    expect(matchedResult).toEqual({
        title: 'Casa Malva',
        url: 'https://hotelcasamalvagto.com/',
    });
});