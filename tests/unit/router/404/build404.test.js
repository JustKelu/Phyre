import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, readFileSync, rmSync, writeFileSync, unlinkSync } from "fs";
import { join } from "node:path";

const userDir = process.cwd();
const outDir = join(userDir, '.phyre/routes/404');
const outPath = join(outDir, '_404Compiled.js');

describe('build404', () => {
    beforeEach(() => {
        mkdirSync(outDir, { recursive: true });
        //forcing to production to avoid .watch() and run in race condition
        process.env.NODE_ENV = 'production';
        vi.resetModules();
    });

    afterEach(() => {
        rmSync(join(userDir, '.phyre'), { recursive: true, force: true });
        delete process.env.NODE_ENV;
        vi.doUnmock('../../../../src/internal/utils/getPhyreConfig.js');
    });

    it('Should create a 404 page from the 404 path in the config', async () => {
        writeFileSync('./_404Page.jsx', 'export default function _404() {return <h1>Error 404 Page not found.</h1>}')
        vi.doMock('../../../../src/internal/utils/getPhyreConfig.js', () => ({
            getPhyreConfig: vi.fn(() => ({
                _404: {
                    useCustom404: true,
                    custom404Path: './_404Page.jsx'
                }
            }))
        }));

        const { build404 } = await import("../../../../src/internal/router/utils/404/build404.ts")
        await build404();

        const result = readFileSync(outPath, 'utf-8');

        expect(result).toContain('function _404()');
        expect(result).toContain('Error 404 Page not found.');
        expect(result).toContain('export {\n  _404 as default\n};');
        unlinkSync('./_404Page.jsx');
    });

    it('Should create a default 404 page in .phyre when the user did not specify a 404 path in the config', async () => {
        const { build404 } = await import("../../../../src/internal/router/utils/404/build404.ts")
        await build404();

        const result = readFileSync(outPath, 'utf-8');

        expect(result).toContain('function _404()');
        expect(result).toContain('import { Link } from "react-router"');
        expect(result).toContain('export {\n  _404 as default\n};');
    });
});