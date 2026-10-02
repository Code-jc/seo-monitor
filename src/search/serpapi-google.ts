import "dotenv/config";

import type {
    MonitoredKeyword,
    SiteConfig,
} from "../types/site-config";

import type {
    SearchTarget,
    VisibilityResult,
} from "../types/search-visibility";

import { matchesTarget } from "./matches-target";

interface SerpApiOrganicResult {
    position?: number;
    title?: string;
    link?: string;
}

interface SerpApiResponse {
    organic_results?: SerpApiOrganicResult[];
    error?: string;
}

const RESULTS_PER_PAGE = 10;
const MAX_POSITION = 50;

async function fetchSerpPage(
    keyword: MonitoredKeyword,
    start: number
): Promise<SerpApiOrganicResult[]> {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "SERPAPI_API_KEY is not configured."
        );
    }

    const searchUrl = new URL(
        "https://serpapi.com/search.json"
    );

    searchUrl.searchParams.set(
        "engine",
        "google"
    );

    searchUrl.searchParams.set(
        "q",
        keyword.query
    );

    searchUrl.searchParams.set(
        "hl",
        keyword.language ?? "es"
    );

    searchUrl.searchParams.set(
        "gl",
        (keyword.country ?? "MX").toLowerCase()
    );

    searchUrl.searchParams.set(
        "device",
        keyword.device ?? "desktop"
    );

    if (keyword.location) {
        searchUrl.searchParams.set(
            "location",
            keyword.location
        );
    }

    searchUrl.searchParams.set(
        "num",
        String(RESULTS_PER_PAGE)
    );

    searchUrl.searchParams.set(
        "start",
        String(start)
    );

    searchUrl.searchParams.set(
        "api_key",
        apiKey
    );

    const response = await fetch(
        searchUrl.toString()
    );

    if (!response.ok) {
        throw new Error(
            `SerpApi HTTP error: ${response.status}`
        );
    }

    const data =
        await response.json() as SerpApiResponse;

    if (data.error) {
        throw new Error(
            `SerpApi error: ${data.error}`
        );
    }

    return data.organic_results ?? [];
}

export async function getGoogleVisibilityViaSerpApi(
    site: SiteConfig,
    keyword: MonitoredKeyword
): Promise<VisibilityResult> {
    const websiteTarget: SearchTarget = {
        id: "website",
        type: "website",
        domain: new URL(site.baseUrl).hostname,
    };

    let matchedResult:
        | SerpApiOrganicResult
        | undefined;

    let matchedPosition: number | null = null;
    let matchedPage: number | null = null;

    for (
        let start = 0;
        start < MAX_POSITION;
        start += RESULTS_PER_PAGE
    ) {
        const organicResults =
            await fetchSerpPage(
                keyword,
                start
            );

        console.log(
            `SerpApi page ${start / RESULTS_PER_PAGE + 1}:`,
            organicResults.length,
            "organic results"
        );

        if (organicResults.length === 0) {
            console.log(
                "No more organic results. Stopping pagination."
            );

            break;
        }

        const matchedIndex =
            organicResults.findIndex(
                (result) => {
                    if (!result.link) {
                        return false;
                    }

                    return matchesTarget(
                        result.link,
                        websiteTarget
                    );
                }
            );

        if (matchedIndex >= 0) {
            matchedResult =
                organicResults[matchedIndex];

            const apiPosition =
                matchedResult.position;

            if (
                apiPosition !== undefined &&
                apiPosition > start
            ) {
                matchedPosition =
                    apiPosition;
            } else {
                matchedPosition =
                    start +
                    (apiPosition ??
                        matchedIndex + 1);
            }

            matchedPage =
                Math.ceil(
                    matchedPosition / 10
                );

            break;
        }
    }

    return {
        siteId: site.id,
        provider: "google",

        query: keyword.query,
        country: keyword.country ?? "MX",
        language: keyword.language ?? "es",
        device: keyword.device ?? "desktop",

        targetId: websiteTarget.id,
        targetType: websiteTarget.type,

        status:
            matchedResult
                ? "success"
                : "not_found",

        found:
            Boolean(matchedResult),

        position:
            matchedPosition,

        resultPage:
            matchedPage,

        matchedUrl:
            matchedResult?.link ?? null,

        matchedTitle:
            matchedResult?.title ?? null,

        /*
         * Deliberately null.
         * Never persist a SerpApi URL because it
         * contains the private API key.
         */
        searchUrl: null,

        checkedAt:
            new Date().toISOString(),

        runId:
            crypto.randomUUID(),
    };
}