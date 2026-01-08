import { describe, it, expect } from "vitest";
import { convertFilePathToRoute } from "../../../../../src/internal/server/api/utils/convertFilePathToRoute.ts";

describe('convertFilePathToRoute', () => {
    it('Should return a route based on the previous path and the file name', () => {
        const result = convertFilePathToRoute("/user", "settings.js");

        expect(result).equal("/user/settings");
    });

    it('Should return just the base path when the file name is index', () => {
        const result = convertFilePathToRoute("/user", "index.js");

        expect(result).equal("/user");
    });

    it('Should return a route with params if the fileName is something like [name]', () => {
        const result = convertFilePathToRoute("/user", "[id].js");

        expect(result).equal("/user/:id");
    });

    it('Should return / for root index file', () => {
        const result = convertFilePathToRoute("", "index.js");

        expect(result).equal("/");
    });

    it('Should normalize the route adding the initial / if the basePath doesn\'t gave it', () => {
        const result = convertFilePathToRoute("user", "index.js");

        expect(result).equal("/user");
    })
});