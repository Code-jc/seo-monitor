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
    if (results.length === 0) {
        return {
            baseline: null,
            latest: null,
            totalMeasurements: 0,
            measurableMeasurements: 0,
            positionChange: null,
            statusChanged: false,
        };
    }

    const measurableResults =
        results.filter(isMeasurable);

    if (measurableResults.length === 0) {
        return {
            baseline: null,
            latest: null,
            totalMeasurements:
                results.length,
            measurableMeasurements: 0,
            positionChange: null,
            statusChanged: false,
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
    };
}