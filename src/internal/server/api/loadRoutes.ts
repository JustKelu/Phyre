import { join } from "node:path";
import { pathToFileURL } from "url";
import type { ApiRoute } from "../../../types/api_routes.js"
import { isModuleKey } from "./utils/isModuleKey.js";
import { readRoutesRecursive } from "./readRoutesRecursive.js";
import express from "express";

const userDir = process.cwd();
const router = express.Router();

export async function loadRoutes(apiDir: string = '') {
    let apiPath = !apiDir ? join(userDir, 'src/server/api') :  join(userDir, apiDir);

    const routeFiles = readRoutesRecursive(apiPath);

    console.log('Registering API...');

    const modules = await Promise.all(
        routeFiles.map(async ({ filePath, routePath }) => {
            const importedModule = await import(pathToFileURL(filePath).href);

            return {
                path: routePath,
                importedModule
            };
        })
    );

    modules.forEach(({ path, importedModule }) => {
        (Object.keys(importedModule) as string[]).forEach((key) => {
            if (!isModuleKey(key)) return;
            if (key.toLowerCase() === 'config') {
                if (!importedModule[key].routes || !Array.isArray(importedModule[key].routes)) {
                    console.error(`Invalid config in ${path}: routes must be an array`);
                    return;
                }

                importedModule[key].routes.forEach((route: ApiRoute) => {
                    let fullPath = path;
                    if (route.path === '/') route.path = '';
                    if (route.path) fullPath += route.path;
                    const httpMethod = route.method;
                    const handler = route.handler;
                    const middlewares = route.middleware || [];

                    if (!handler || typeof handler !== 'function') {
                        console.error(`Invalid handler for ${route.method} ${fullPath}`);
                        return;
                    }
                    
                    // @ts-ignore
                    router[httpMethod.toLowerCase()](fullPath, ...middlewares, handler);

                    const middlewareInfo = middlewares.length > 0 ? ` [${middlewares.length} middleware]` : '';
                    console.log(`✓ Registered ${route.method.padEnd(6)} /api${fullPath}${middlewareInfo}`);
                });

                return;
            }

            if (key.toLowerCase() !== 'config') {
                const httpMethod = key;
                const handler = importedModule[key];
                const middlewares = handler.middleware || [];

                if (typeof handler !== 'function') {
                    console.error(`Invalid handler for ${key} ${path}`);
                    return;
                }

                // @ts-ignore
                router[httpMethod.toLowerCase()](path, ...middlewares, handler);

                const middlewareInfo = middlewares.length > 0 ? ` [${middlewares.length} middleware]` : '';
                console.log(`✓ Registered ${key.padEnd(6)} /api${path}${middlewareInfo}`);
            }
        });
    });

    return router;
}