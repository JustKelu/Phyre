import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getPhyreConfig } from "../../../src/internal/utils/getPhyreConfig";
import { unlinkSync, writeFileSync } from "node:fs";

describe('getPhyreConfig', () => {
    beforeEach(() => {
        writeFileSync('./phyre.config.js', `
        export const monorepo = { 
            usePackStructure: true, 
            packages: [
                { name: 'web', prefix: '/'}
            ]     
        };`);
    });

    afterEach(() => {
        unlinkSync('./phyre.config.js');
    });

    it('Should import correctly the config file', () => {
        const result = getPhyreConfig();

        expect(result.monorepo).toBeDefined();
        expect(result.monorepo.usePackStructure).toEqual(true);
        expect(result.monorepo.packages[0]).toEqual({ name: 'web', prefix: '/' });
    })
});