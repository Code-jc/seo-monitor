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

export interface VisibilityReport {
    siteId: string;
    siteName: string;

    keyword: string;

    technicalSeo:
    TechnicalSeoResult | null;

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
    };

    change: {
        positionChange:
        number | null;

        statusChanged:
        boolean;

        totalMeasurements:
        number;
    };
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
        },

        change: {
            positionChange:
                summary.positionChange,

            statusChanged:
                summary.statusChanged,

            totalMeasurements:
                summary.totalMeasurements,
        },
    };
}