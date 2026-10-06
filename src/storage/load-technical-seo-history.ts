import fs from "node:fs";
import path from "node:path";

import type { TechnicalSeoResult } from "../types/technical-seo";

export function loadTechnicalSeoHistory(
    siteId: string
): TechnicalSeoResult[] {
    const dataRoot =
        process.env.SEO_DATA_DIR ??
        path.resolve("data");

    const filePath = path.resolve(
        dataRoot,
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