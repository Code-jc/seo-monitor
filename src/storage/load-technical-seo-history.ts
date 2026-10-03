import fs from "node:fs";
import path from "node:path";

import type { TechnicalSeoResult } from "../types/technical-seo";

export function loadTechnicalSeoHistory(
    siteId: string
): TechnicalSeoResult[] {
    const filePath = path.resolve(
        "data",
        "technical-seo",
        `${siteId}.history.json`
    );

    if (!fs.existsSync(filePath)) {
        return [];
    }

    const history: TechnicalSeoResult[] = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    return history.sort(
        (a, b) =>
            new Date(a.checkedAt).getTime() -
            new Date(b.checkedAt).getTime()
    );
}