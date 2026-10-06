import fs from "node:fs";
import path from "node:path";
import type { VisibilityResult } from "../types/search-visibility";

export function loadVisibilityResults(
    siteId: string
): VisibilityResult[] {
    const dataRoot =
        process.env.SEO_DATA_DIR ??
        path.resolve("data");

    const filePath = path.resolve(
        dataRoot,
        "visibility",
        `${siteId}.json`
    );

    if (!fs.existsSync(filePath)) {
        return [];
    }

    const content = fs.readFileSync(
        filePath,
        "utf-8"
    );

    return JSON.parse(content);
}