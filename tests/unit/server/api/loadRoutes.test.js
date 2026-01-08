import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/internal/server/api/readRoutesRecursive.ts', () => ({
    readRoutesRecursive: vi.fn()
}));

vi.mock('url', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        pathToFileURL: vi.fn((path) => ({
            href: `mocked://${path}`
        }))
    };
});

vi.mock('express', async (importOriginal) => {
    const actual = await importOriginal();
    const mockRouter = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
    return {
        ...actual,
        default: {
            ...actual.default,
            Router: () => mockRouter
        },
        __mockRouter: mockRouter
    }
});

describe('loadRoutes', () => {
    describe('direct exports', () => {
        beforeEach(() => {
            vi.spyOn(console, 'log').mockImplementation(() => {});
            vi.resetModules();

            vi.doMock('mocked://src/server/api/get.js', () => {
                const handler = vi.fn();
                handler.middleware = ["Middle1", "Middle2"]
                return { GET: handler }
            });
            vi.doMock('mocked://src/server/api/put.js', () => ({
                PUT: vi.fn((req, res) => res.send('ok'))
            }));
            vi.doMock('mocked://src/server/api/post.js', () => ({
                POST: vi.fn((req, res) => res.send('ok'))
            }));
            vi.doMock('mocked://src/server/api/patch.js', () => ({
                PATCH: vi.fn((req, res) => res.send('ok'))
            }));
            vi.doMock('mocked://src/server/api/delete.js', () => ({
                DELETE: vi.fn((req, res) => res.send('ok'))
            }));
        });

        it('Should register routes', async () => {
            const { readRoutesRecursive } = await import('../../../../src/internal/server/api/readRoutesRecursive.ts');
            const { loadRoutes } = await import('../../../../src/internal/server/api/loadRoutes.ts');

            vi.mocked(readRoutesRecursive).mockReturnValue([
                { filePath: "src/server/api/get.js", routePath: "/get" },
                { filePath: "src/server/api/put.js", routePath: "/put" },
                { filePath: "src/server/api/post.js", routePath: "/post" },
                { filePath: "src/server/api/patch.js", routePath: "/patch" },
                { filePath: "src/server/api/delete.js", routePath: "/delete" },
            ]);

            const router = await loadRoutes('/src/server/api');

            expect(router).toBeDefined();
            expect(router.get).toHaveBeenCalledWith('/get', "Middle1", "Middle2", expect.any(Function));
            expect(router.put).toHaveBeenCalledWith('/put', expect.any(Function));
            expect(router.post).toHaveBeenCalledWith('/post', expect.any(Function));
            expect(router.patch).toHaveBeenCalledWith('/patch', expect.any(Function));
            expect(router.delete).toHaveBeenCalledWith('/delete', expect.any(Function));
        });
    });

    describe('config object', () => {
        beforeEach(() => {
            vi.spyOn(console, 'log').mockImplementation(() => {});
            vi.resetModules();

            vi.doMock('mocked://src/server/api/user.js', () => ({
                config : {
                    routes: [
                        { path: '/', method: "GET", handler: vi.fn() },
                        { path: '/settings', method: "PUT", handler: vi.fn(), middleware: ["Auth"] },
                        { path: '/comment', method: "POST", handler: vi.fn(), middleware: ["Auth", "Sanitize"] },
                        { path: '/edit-comment', method: "PATCH", handler: vi.fn(), middleware: ["Auth", "Sanitize"] },
                        { path: '/delete-comment', method: "DELETE", handler: vi.fn(), middleware: ["Auth"] },
                    ]
                }
            }));
        });

        it('Should register routes from config', async () => {
            const { readRoutesRecursive } = await import('../../../../src/internal/server/api/readRoutesRecursive.ts');
            const { loadRoutes } = await import('../../../../src/internal/server/api/loadRoutes.ts');

            vi.mocked(readRoutesRecursive).mockReturnValue([
                { filePath: 'src/server/api/user.js', routePath: '/user' },
            ]);

            const router = await loadRoutes('/src/server/api');

            expect(router).toBeDefined();
            expect(router.get).toHaveBeenCalledWith('/user', expect.any(Function));
            expect(router.put).toHaveBeenCalledWith('/user/settings', 'Auth', expect.any(Function));
            expect(router.post).toHaveBeenCalledWith('/user/comment', 'Auth', 'Sanitize', expect.any(Function));
            expect(router.patch).toHaveBeenCalledWith('/user/edit-comment', 'Auth', 'Sanitize', expect.any(Function));
            expect(router.delete).toHaveBeenCalledWith('/user/delete-comment', 'Auth', expect.any(Function));
        });
    });
});