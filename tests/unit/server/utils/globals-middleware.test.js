import { vi, describe, it, expect } from "vitest";
import fs from 'fs';
import { join } from 'path';

const userDir = process.cwd();

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn()
    }
}));

const mockRequire = vi.fn();
vi.mock('node:module', () => ({
    createRequire: vi.fn(() => mockRequire)
}));

describe('globals-middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        mockRequire.mockReturnValue(undefined);
    });

    it('Should return undefined if no global middleware file exists', async () => {
        const { globalsMiddleware } = await import('../../../../src/internal/server/utils/globals-middleware.ts');

        vi.mocked(fs.existsSync).mockReturnValue(false);

        const result = await globalsMiddleware();
        expect(result).toBeUndefined();
    });

    it('Should return middlewares when .js file exists', async () => {
        const { globalsMiddleware } = await import('../../../../src/internal/server/utils/globals-middleware.ts');

        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return path.toString().endsWith('.js');
        })

        mockMiddlewares(join(userDir, '/src/server/global.js'));

        const result = await globalsMiddleware();
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('testMiddleware');
        expect(result[1].name).toBe('authMiddleware');
    });

    it('Should return middlewares when .ts file exists', async () => {
        const { globalsMiddleware } = await import('../../../../src/internal/server/utils/globals-middleware.ts');

        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return path.toString().endsWith('.ts');
        });

        mockMiddlewares(join(userDir, '/src/server/global.ts'));

        const result = await globalsMiddleware();
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('testMiddleware');
        expect(result[1].name).toBe('authMiddleware');
    });

    it('Should search the global file in the first package when the packages structure is active', async () => {
        mockRequire.mockReturnValue({
            monorepo: {
                usePackStructure: true,
                packages: [
                    { name: 'web', prefix: '/' },
                    { name: 'admin', prefix: '/admin' },
                ]
            }
        });

        const { globalsMiddleware } = await import('../../../../src/internal/server/utils/globals-middleware.ts');

        const expectedConfigPath = join(userDir, 'phyre.config.js');
        expect(mockRequire).toHaveBeenCalledWith(expectedConfigPath);
        expect(mockRequire).toHaveBeenCalledTimes(1);

        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return path.toString().endsWith('.js');
        });

        //Testing the global path from the first package
        mockMiddlewares(join(userDir, '/packages/web/src/server/global.js'));

        const result = await globalsMiddleware();
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('testMiddleware');
        expect(result[1].name).toBe('authMiddleware');

        const expectedJsPath = join(userDir, 'packages/web/src/server/global.js');
        expect(fs.existsSync).toHaveBeenCalledWith(expectedJsPath);
    });
});

function mockMiddlewares(path) {
    vi.doMock(path, () => ({
        middlewares: [
            function testMiddleware() {},
            function authMiddleware() {}
        ]
    }));
}