import type { SearchTarget } from "../types/search-visibility";

export function matchesTarget(
    resultUrl: string,
    target: SearchTarget
): boolean {
    try {
        const url = new URL(resultUrl);

        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }

        const domain = target.domain.toLowerCase();
        const hostname = url.hostname.toLowerCase();

        const matchesDomain =
            hostname === domain ||
            hostname.endsWith(`.${domain}`);

        return matchesDomain &&
            (!target.urlContains || url.href.includes(target.urlContains));
    }
    catch {
        return false;
    }
}