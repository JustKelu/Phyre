import fs from 'fs'
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import type { PhyreConfig } from "../../../types/config";
import { PhyrePackage } from "../../../../rust";
import { RequestHandler } from "express";

const userDir = process.cwd();

//Importing the packages structure config
const require = createRequire(import.meta.url);
const configPath = resolve(userDir, 'phyre.config.js');

let phyreConfig: PhyreConfig | undefined;
try {
    phyreConfig = require(configPath);
} catch (err) {
    console.error("Error to load phyre config:", err);
}

let packageWithGlobals: PhyrePackage | undefined;
if (phyreConfig?.monorepo?.usePackStructure) {
    if (phyreConfig?.monorepo?.packages) {
        packageWithGlobals = phyreConfig.monorepo?.packages[0];
    }
}

export async function globalsMiddleware() {
    let globalPath: string;
    if (packageWithGlobals) {
        globalPath = join(userDir, `packages/${packageWithGlobals.name}/src/server/global`)
    } else {
        globalPath = join(userDir, 'src/server/global');
    }
    
    const jsPath: string = globalPath + '.js';
    const tsPath: string = globalPath + '.ts';
    if (fs.existsSync(jsPath)) {
        const middlewares: [RequestHandler] = await loadMiddleware(jsPath);
        
        return middlewares
    } else if (fs.existsSync(tsPath)) {
        const middlewares: [RequestHandler] = await loadMiddleware(tsPath);
        
        return middlewares
    }
}

async function loadMiddleware(middlePath: string) {
    const { middlewares } = await import(middlePath);

    console.log('Loading globals middlewares...');
    middlewares.forEach((element: RequestHandler) => {
        console.log('✓ Loaded', element.name);
    });

    return middlewares;
}