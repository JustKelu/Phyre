import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";
import { scanner } from "../../../src/internal/router/route-scanner.ts";
import { chdir, cwd } from 'process';
import { rmSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const originalCwd = cwd();
const testDir = join(originalCwd, 'tests/mock-project');
const outPath = join(testDir, '.phyre/routes/import-routes.jsx');

describe('route-scanner', () => {
    beforeAll(() => {
        chdir(testDir);
    });

    afterAll(() => {
        chdir(originalCwd)
    });

    afterEach(() => {
        rmSync(join(testDir, '.phyre'), { recursive: true, force: true });
    });

    it('Should create import-routes.jsx from mock-project', () => {
        scanner();

        let result = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : undefined;

        expect(result).toBeDefined();
        expect(result).toContain('export const routes = [');
        expect(result).toContain('Component: Layout');
        expect(result).toContain('Component: HomeElement');
        expect(result).toContain('Component: AboutElement');
    });
});