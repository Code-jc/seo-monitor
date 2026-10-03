import type {
    VisibilityResult,
} from "../types/search-visibility";

import {
    getVisibilitySummary,
} from "./get-visibility-summary";

export interface KeywordVisibilitySummary {
    query: string;

    history?: {
        checkedAt: string;
        status: VisibilityResult["status"];
        position: number | null;
    }[];

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

    latestAttempt?: {
        status: VisibilityResult["status"];
        checkedAt: string;
    } | null;
    positionChange:
    number | null;

    totalMeasurements:
    number;

    measurableMeasurements:
    number;
}

export function getKeywordVisibilitySummaries(
    results: VisibilityResult[]
): KeywordVisibilitySummary[] {
    const grouped =
        new Map<
            string,
            VisibilityResult[]
        >();

    for (const result of results) {
        const existing =
            grouped.get(
                result.query
            ) ?? [];

        existing.push(
            result
        );

        grouped.set(
            result.query,
            existing
        );
    }

    return Array.from(
        grouped.entries()
    ).map(
        ([query, keywordResults]) => {
            const orderedResults =
                [...keywordResults].sort(
                    (a, b) =>
                        new Date(
                            a.checkedAt
                        ).getTime() -
                        new Date(
                            b.checkedAt
                        ).getTime()
                );

            const summary =
                getVisibilitySummary(
                    orderedResults
                );

            return {
                query,

                history: orderedResults.map(
                    (result) => ({
                        checkedAt: result.checkedAt,
                        status: result.status,
                        position: result.position,
                    })
                ),

                latestAttempt: summary.latestAttempt
                    ? {
                        status: summary.latestAttempt.status,
                        checkedAt: summary.latestAttempt.checkedAt,
                    }
                    : null,

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

                positionChange:
                    summary.positionChange,

                totalMeasurements:
                    summary.totalMeasurements,

                measurableMeasurements:
                    summary.measurableMeasurements,
            };
        }
    );
}