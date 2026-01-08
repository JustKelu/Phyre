import { describe, it, expect, vi } from 'vitest';
import { readRoutesRecursive } from '../../../../src/internal/server/api/readRoutesRecursive.ts';
import { normalize } from 'path';
import { fs, vol } from 'memfs';

vi.mock('fs', async () => {
    const { fs } = await import('memfs');
    return { default: fs };
});

vol.fromJSON({
    '/src/server/api/login.js': '',
    '/src/server/api/user/index.js': '',
    '/src/server/api/user/profile.js': '',
});

describe('readRoutesRecursive', () => {
    it('Should read all routes recursively', async () => {
        const routes = await readRoutesRecursive('/src/server/api');

        expect(routes).toHaveLength(3);
        expect(routes).toContainEqual({
            filePath: normalize('/src/server/api/login.js'),
            routePath: '/login'
        });
        expect(routes).toContainEqual({
            filePath: normalize('/src/server/api/user/index.js'),
            routePath: '/user'
        });
        expect(routes).toContainEqual({
            filePath: normalize('/src/server/api/user/profile.js'),
            routePath: '/user/profile'
        });
    });

    it('Should handle empty directories and return an empty array', async () => {
        vol.reset();
        vol.fromJSON({
            '/src/empty/': null
        });
        const routes = await readRoutesRecursive('/src/empty');

        expect(routes).toHaveLength(0);
        expect(routes).toEqual([]);
    });
});