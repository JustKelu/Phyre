import fs from 'fs'
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const userDir = process.cwd();

//Importing the packages structure config
const require = createRequire(import.meta.url);
const configPath = resolve(userDir, 'phyre.config.js');

let phyreConfig;
try {
    phyreConfig = require(configPath);
} catch (err) {
    console.error("Error to load phyre config:", err);
}

let packageWithGlobals
if (phyreConfig?.default?.packagesStructure) {
    packageWithGlobals = phyreConfig.default?.packages[0];
}

export async function globalsMiddleware() {
    let globalPath;
    if (packageWithGlobals) {
        globalPath = join(userDir, `packages/${packageWithGlobals.name}/src/server/global`)
    } else {
        globalPath = join(userDir, 'src/server/global');
    }
    
    const jsPath = globalPath + '.js';
    const tsPath = globalPath + '.ts';
    if (fs.existsSync(jsPath)) {
        const middlewares = await loadMiddleware(jsPath);
        
        return middlewares
    } else if (fs.existsSync(tsPath)) {
        const middlewares = await loadMiddleware(tsPath);
        
        return middlewares
    }
}

async function loadMiddleware(middlePath) {
    const { middlewares } = await import(middlePath);
    console.log('Loading globals middlewares...')
    middlewares.forEach(element => {
        console.log('✓ Loaded', element.name);
    });

    return middlewares;
}