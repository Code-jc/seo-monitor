import type {
    VisibilityResult,
} from "../types/search-visibility";

export interface VisibilitySummary {
    baseline: VisibilityResult | null;
    latest: VisibilityResult | null;
    totalMeasurements: number;
    measurableMeasurements: number;
    positionChange: number | null;
    statusChanged: boolean;
    latestAttempt?: VisibilityResult | null;
}

function isMeasurable(
    result: VisibilityResult
): boolean {
    return (
        result.status === "success" ||
        result.status === "not_found"
    );
}

export function getVisibilitySummary(
    results: VisibilityResult[]
): VisibilitySummary {
    const latestAttempt = [...results]
        .sort(
            (a, b) =>
                new Date(a.checkedAt).getTime() -
                new Date(b.checkedAt).getTime()
        )
        .at(-1) ?? null;

    if (results.length === 0) {
        return {
            baseline: null,
            latest: null,
            totalMeasurements: 0,
            measurableMeasurements: 0,
            positionChange: null,
            statusChanged: false,
            latestAttempt,
        };
    }

    const measurableResults = results
        .filter(isMeasurable)
        .sort(
            (a, b) =>
                new Date(a.checkedAt).getTime() -
                new Date(b.checkedAt).getTime()
        );

    if (measurableResults.length === 0) {
        return {
            baseline: null,
            latest: null,
            totalMeasurements:
                results.length,
            measurableMeasurements: 0,
            positionChange: null,
            statusChanged: false,
            latestAttempt,
        };
    }

    const baseline =
        measurableResults[0];

    const latest =
        measurableResults[
        measurableResults.length - 1
        ];

    const positionChange =
        baseline.position !== null &&
            latest.position !== null
            ? baseline.position -
            latest.position
            : null;

    return {
        baseline,
        latest,
        totalMeasurements:
            results.length,

        measurableMeasurements:
            measurableResults.length,

        positionChange,

        statusChanged:
            baseline.status !==
            latest.status,

        latestAttempt,
    };
}