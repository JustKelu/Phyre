import fs from 'fs';
import esbuild from 'esbuild';

import { fileURLToPath } from "url";
import { createRequire } from 'node:module';
import { join, resolve, dirname  } from 'node:path';

const userDir = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

//Importing the 404 component config
const require = createRequire(import.meta.url);
const configPath = resolve(userDir, 'phyre.config.js');

let phyreConfig;
try {
    phyreConfig = require(configPath);
} catch (err) {
    console.error("Error to load phyre config:", err);
}
const phyre404 = phyreConfig._404;

let entryPoints;

export async function build404() {
    //Render the custom 404 just if exist
    if (phyre404.custom404 && fs.existsSync(join(userDir, phyre404.custom404Path))) {
        const _404Path = phyre404.custom404Path;

        entryPoints = join(userDir, _404Path);    
    } else {
        entryPoints = join(__dirname, '_404Page.jsx');
    }
    
    const _404CTX = await esbuild.context({
        entryPoints: [entryPoints],
        bundle: true,
        jsx: 'automatic',
        format: 'esm',
        external: ['react', 'react-router'],
        outfile: join(userDir, '.phyre/routes/404/_404Compiled.js') 
    });
    
    process.env.NODE_ENV === 'production' ? await _404CTX.rebuild() : await _404CTX.watch();
}