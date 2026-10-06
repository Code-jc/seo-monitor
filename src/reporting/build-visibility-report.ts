import type {
    SiteConfig,
} from "../types/site-config";

import type {
    VisibilityResult,
} from "../types/search-visibility";

import type {
    TechnicalSeoResult,
} from "../types/technical-seo";

import type {
    VisibilitySummary,
} from "../visibility/get-visibility-summary";

import type {
    KeywordVisibilitySummary,
} from "../visibility/get-keyword-visibility-summaries";

export interface VisibilityReport {
    siteId: string;
    siteName: string;

    keyword: string;

    searchContext?: {
        device: VisibilityResult["device"];
        country: string;
        language: string;
    } | null;

    keywordSummaries?:
    KeywordVisibilitySummary[];

    technicalSeo:
    TechnicalSeoResult | null;

    technicalSeoHistory?: TechnicalSeoResult[];

    baseline: {
        status:
        | VisibilityResult["status"]
        | null;

        position:
        number | null;

        checkedAt:
        string | null;
    };

    latest: {
        status:
        | VisibilityResult["status"]
        | null;

        position:
        number | null;

        checkedAt:
        string | null;

        resultsReviewed?: number | null;
        pagesReviewed?: number | null;
        searchLimit?: number | null;

    };

    change: {
        positionChange: number | null;
        statusChanged: boolean;
        totalMeasurements: number;
        measurableMeasurements: number;
    };

    latestAttempt?: {
        status: VisibilityResult["status"];
        checkedAt: string;
    } | null;
}

export function buildVisibilityReport(
    site: SiteConfig,
    keyword: string,
    summary: VisibilitySummary,
    technicalSeo:
        TechnicalSeoResult | null = null
): VisibilityReport {
    return {
        siteId:
            site.id,

        siteName:
            site.name,

        keyword,

        searchContext: summary.latest
            ? {
                device: summary.latest.device,
                country: summary.latest.country,
                language: summary.latest.language,
            }
            : null,


        latestAttempt: summary.latestAttempt
            ? {
                status: summary.latestAttempt.status,
                checkedAt: summary.latestAttempt.checkedAt,
            }
            : null,

        technicalSeo,

        baseline: {
            status:
                summary.baseline
                    ?.status ??
                null,

            position:
                summary.baseline
                    ?.position ??
                null,

            checkedAt:
                summary.baseline
                    ?.checkedAt ??
                null,
        },

        latest: {
            status:
                summary.latest
                    ?.status ??
                null,

            position:
                summary.latest
                    ?.position ??
                null,

            checkedAt:
                summary.latest
                    ?.checkedAt ??
                null,

            resultsReviewed:
                summary.latest?.resultsReviewed ?? null,

            pagesReviewed:
                summary.latest?.pagesReviewed ?? null,

            searchLimit:
                summary.latest?.searchLimit ?? null,
        },

        change: {
            positionChange: summary.positionChange,
            statusChanged: summary.statusChanged,
            totalMeasurements: summary.totalMeasurements,
            measurableMeasurements: summary.measurableMeasurements,
        },
    };
}