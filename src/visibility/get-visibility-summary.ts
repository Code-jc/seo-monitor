import type { VisibilityResult } from "../types/search-visibility";

export interface VisibilitySummary {
    baseline: VisibilityResult | null;
    latest: VisibilityResult | null;
    totalMeasurements: number;
    positionChange: number | null;
    statusChanged: boolean;
}

export function getVisibilitySummary(
    results: VisibilityResult[]
): VisibilitySummary {
    if (results.length === 0) {
        return {
            baseline: null,
            latest: null,
            totalMeasurements: 0,
            positionChange: null,
            statusChanged: false,
        };
    }

    const baseline = results[0];
    const latest = results[results.length - 1];

    const positionChange =
        baseline.position !== null &&
            latest.position !== null
            ? baseline.position - latest.position
            : null;

    return {
        baseline,
        latest,
        totalMeasurements: results.length,
        positionChange,
        statusChanged:
            baseline.status !== latest.status,
    };
}