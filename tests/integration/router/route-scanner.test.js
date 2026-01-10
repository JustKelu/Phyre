import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { chdir, cwd } from 'process';
import { rmSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const originalCwd = cwd();
const testDir = join(originalCwd, 'tests/integration/router/mock-project');
const outPath = join(testDir, '.phyre/routes/import-routes.jsx');

describe('route-scanner', () => {
    beforeAll(() => {
        chdir(testDir);
    });

    afterAll(() => {
        chdir(originalCwd)
    });

    beforeEach(() => {
        vi.resetModules();
    })

    afterEach(() => {
        rmSync(join(testDir, '.phyre'), { recursive: true, force: true });
    });

    it('Should create import-routes.jsx from /src', async () => {
        const { scanner } = await import('../../../src/internal/router/route-scanner');
        scanner();

        let result = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : undefined;

        expect(result).toBeDefined();
        expect(result).toContain('export const routes = [');
        expect(result).toContain('Component: Layout');
        expect(result).toContain('Component: HomeElement');
        expect(result).toContain('Component: AboutElement');
    });

    it('Should create import-routes.jsx with packages prefix from /packages if the packages structure is active in the config', async () => {
        vi.doMock('../../../src/internal/utils/getPhyreConfig.ts', () => ({
            getPhyreConfig: vi.fn(() => ({
                monorepo: {
                    usePackStructure: true,
                    packages: [
                        { name: 'web', prefix: '/' },
                        { name: 'admin', prefix: '/admin' },
                    ]
                }
            }))
        }));
        const { scanner } = await import('../../../src/internal/router/route-scanner');
        scanner();

        let result = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : undefined;

        expect(result).toBeDefined();
        expect(result).toContain('export const routes = [');
        expect(result).toContain('Component: Admin_layout');
        expect(result).toContain('Component: admin_HomeElement');
        expect(result).toContain('Component: admin_AboutElement');
    });
});