import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPublicEnvs } from '../../../src/internal/env/getPublicEnvs.ts';

describe('getPublicEnvs', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should filter only PUBLIC_ prefixed env vars', () => {
        process.env = {
            PUBLIC_API_URL: 'https://api.example.com',
            SECRET_KEY: 'secret123',
            PUBLIC_DEBUG: 'true'
        };

        const result = getPublicEnvs();

        expect(result).toHaveProperty('process.env.PUBLIC_API_URL');
        expect(result).toHaveProperty('process.env.PUBLIC_DEBUG');
        expect(result).not.toHaveProperty('process.env.SECRET_KEY');
        expect(result['process.env.PUBLIC_API_URL']).toBe('"https://api.example.com"');
        expect(result['process.env.PUBLIC_DEBUG']).toBe('"true"');
    });

    it('should return empty object when no PUBLIC_ vars exist', () => {
        process.env = {
            SECRET_KEY: 'secret123',
            PRIVATE_VAR: 'private'
        };

        const result = getPublicEnvs();

        expect(Object.keys(result)).toHaveLength(0);
    });

    it('should handle empty process.env', () => {
        process.env = {};

        const result = getPublicEnvs();

        expect(result).toEqual({});
    });
});