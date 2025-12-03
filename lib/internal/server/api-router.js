import express from 'express';
import fs from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const userDir = process.cwd();
const router = express.Router();

function readRoutesRecursive(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const routes = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
            const folderName = entry.name;
            const newBasePath = `${basePath}/${folderName}`;
            const subRoutes = readRoutesRecursive(fullPath, newBasePath);
            routes.push(...subRoutes);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
            const routePath = convertFilePathToRoute(basePath, entry.name);
            routes.push({
                filePath: fullPath,
                routePath: routePath
            });
        }
    }

    return routes;
}

function convertFilePathToRoute(basePath, fileName) {
    let name = fileName.replace(/\.(js|ts)$/, '');
    
    if (name === 'index') {
        name = '';
    }
    
    const converted = name.replace(/\[(\w+)\]/g, ':$1');
    
    let fullPath = `${basePath}/${converted}`;
    
    fullPath = fullPath.replace(/\/+/g, '/');
    
    return fullPath || '/';
}

export async function loadRoutes(apiDir = '') {
    let apiPath;

    if (!apiDir) {
        apiPath = join(userDir, 'src/server/api');
    } else {
        apiPath = join(userDir, apiDir);
    }

    const routeFiles = readRoutesRecursive(apiPath);
    
    console.log('Registering API...');
    
    const modules = await Promise.all(
        routeFiles.map(async ({ filePath, routePath }) => {
            const importedModule = await import(pathToFileURL(filePath).href);

            return {
                path: routePath,
                module: importedModule
            };
        })
    );
    
    modules.forEach(({ path, module }) => {
        Object.keys(module).forEach((key) => {
            if (key.toLowerCase() === 'config') {
                if (!module[key].routes || !Array.isArray(module[key].routes)) {
                    console.error(`âœ— Invalid config in ${path}: routes must be an array`);
                    return;
                }

                module[key].routes.forEach(route => {
                    let fullPath = path;
                    if (route.path === '/') route.path = '';
                    if (route.path) fullPath += route.path;
                    const httpMethod = route.method.toLowerCase();
                    const handler = route.handler;
                    const middlewares = route.middleware || [];

                    if (!handler || typeof handler !== 'function') {
                        console.error(`— Invalid handler for ${route.method} ${fullPath}`);
                        return;
                    }

                    router[httpMethod](fullPath, ...middlewares, handler);

                    const middlewareInfo = middlewares.length > 0 ? ` [${middlewares.length} middleware]` : '';
                    console.log(`✓ Registered ${route.method.padEnd(6)} /api${fullPath}${middlewareInfo}`);
                });

                return;
            }

            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
            
            if (!validMethods.includes(key)) {
                return; 
            }

            const httpMethod = key.toLowerCase();
            const handler = module[key];
            const middlewares = handler.middleware || []; 

            if (typeof handler !== 'function') {
                console.error(`— Invalid handler for ${key} ${path}`);
                return;
            }

            router[httpMethod](path, ...middlewares, handler);

            const middlewareInfo = middlewares.length > 0 ? ` [${middlewares.length} middleware]` : '';
            console.log(`✓ Registered ${key.padEnd(6)} /api${path}${middlewareInfo}`);
        });
    });

    return router;
}