import { describe, it, expect } from "vitest";
import { isModuleKey } from "../../../../../src/internal/server/api/utils/isModuleKey.ts";

describe('isModuleKey', () => {
    it('Should return true from GET, POST, PUT, PATCH and DELETE also if malformed', () => {
        const result1 = isModuleKey('GeT');
        const result2 = isModuleKey('POsT');
        const result3 = isModuleKey('PuT');
        const result4 = isModuleKey('PaTCH');
        const result5 = isModuleKey('DEletE');

        expect(result1).toEqual(true);
        expect(result2).toEqual(true);
        expect(result3).toEqual(true);
        expect(result4).toEqual(true);
        expect(result5).toEqual(true);
    });

    it('Should return true from config also if malformed', () => {
        const result1 = isModuleKey('ConFig');
        const result2 = isModuleKey('config');

        expect(result1).toEqual(true);
        expect(result2).toEqual(true);
    });
});