import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { wrapRouter } from "../../../src/internal/router/route-wrapper.js";
import { mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "node:path";

const userDir = process.cwd();
const outDir = join(userDir, '.phyre/routes');
const outPath = join(outDir, 'index.js');

describe('route-wrapper', () => {
    beforeEach(() => {
        mkdirSync(outDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(join(userDir, '.phyre'), { recursive: true, force: true });
    });

    it('Should include WebSocket connection in development', () => {
        delete process.env.NODE_ENV;

        wrapRouter();
        const result = readFileSync(outPath, 'utf-8');

        expect(result).toContain('import WebSocket from \'ws\'');
        expect(result).toContain('ws://localhost');
        expect(result).toContain('reloadRoutes');
        expect(result).toContain('export { router }');
    });

    it('Should NOT include WebSocket connection in production', () => {
        process.env.NODE_ENV = 'production';

        wrapRouter();
        const result = readFileSync(outPath, 'utf-8');

        expect(result).not.toContain('import WebSocket');
        expect(result).not.toContain('ws://localhost');
        expect(result).toContain('export { router }');

        delete process.env.NODE_ENV;
    });
});