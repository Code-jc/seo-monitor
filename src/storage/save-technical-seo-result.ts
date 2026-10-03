import fs from "node:fs";
import path from "node:path";

import type {
    TechnicalSeoResult,
} from "../types/technical-seo";

export function saveTechnicalSeoResult(
    result: TechnicalSeoResult
): string {
    const directory = path.resolve(
        "data",
        "technical-seo"
    );

    fs.mkdirSync(directory, {
        recursive: true,
    });

    const filePath = path.join(
        directory,
        `${result.siteId}.json`
    );

    const historyPath = path.join(
        directory,
        `${result.siteId}.history.json`
    );

    const history: TechnicalSeoResult[] =
        fs.existsSync(historyPath)
            ? JSON.parse(
                fs.readFileSync(historyPath, "utf-8")
            )
            : [];

    // Conserva la auditoría anterior al iniciar el historial.
    if (
        history.length === 0 &&
        fs.existsSync(filePath)
    ) {
        const previous: TechnicalSeoResult =
            JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

        history.push(previous);
    }

    const alreadySaved = history.some(
        (entry) =>
            entry.siteId === result.siteId &&
            entry.checkedAt === result.checkedAt
    );

    if (!alreadySaved) {
        history.push(result);
    }

    history.sort(
        (a, b) =>
            new Date(a.checkedAt).getTime() -
            new Date(b.checkedAt).getTime()
    );

    fs.writeFileSync(
        historyPath,
        JSON.stringify(history, null, 2),
        "utf-8"
    );

    fs.writeFileSync(
        filePath,
        JSON.stringify(result, null, 2),
        "utf-8"
    );

    return filePath;
}