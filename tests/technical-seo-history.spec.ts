import { expect, test } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { saveTechnicalSeoResult } from "../src/storage/save-technical-seo-result";
import type { TechnicalSeoResult } from "../src/types/technical-seo";

test("Preserve technical audits and avoid duplicate measurements", () => {
    const originalDirectory = process.cwd();
    const temporaryDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "technical-seo-history-")
    );

    const previous: TechnicalSeoResult = {
        siteId: "test-site",
        checkedAt: "2026-10-01T12:00:00Z",
        passed: 0,
        total: 1,
        checks: [
            {
                id: "sitemap",
                label: "Sitemap XML",
                passed: false,
            },
        ],
    };

    const latest: TechnicalSeoResult = {
        ...previous,
        checkedAt: "2026-10-02T12:00:00Z",
        passed: 1,
        checks: [
            {
                id: "sitemap",
                label: "Sitemap XML",
                passed: true,
            },
        ],
    };

    try {
        process.chdir(temporaryDirectory);

        const directory = path.resolve("data", "technical-seo");
        fs.mkdirSync(directory, { recursive: true });

        const latestPath = path.join(directory, "test-site.json");
        const historyPath = path.join(directory, "test-site.history.json");

        // Simula el archivo existente antes de añadir historial.
        fs.writeFileSync(latestPath, JSON.stringify(previous), "utf-8");

        saveTechnicalSeoResult(latest);
        saveTechnicalSeoResult(latest);

        const history: TechnicalSeoResult[] = JSON.parse(
            fs.readFileSync(historyPath, "utf-8")
        );

        expect(history).toEqual([previous, latest]);

        const savedLatest = JSON.parse(
            fs.readFileSync(latestPath, "utf-8")
        );

        expect(savedLatest).toEqual(latest);
    } finally {
        process.chdir(originalDirectory);
        fs.rmSync(temporaryDirectory, {
            recursive: true,
            force: true,
        });
    }
});