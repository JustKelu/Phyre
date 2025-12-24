import fs from 'fs';
import esbuild from 'esbuild';

import { fileURLToPath } from "url";
import { join, dirname  } from 'node:path';
import { PhyreConfig } from '../../../../types/routes';
import { getPhyreConfig } from '../../../utils/getPhyreConfig.js';

const userDir = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


let phyreConfig: PhyreConfig | undefined = getPhyreConfig();
const phyre404 = phyreConfig ? phyreConfig._404 : undefined;

let entryPoints;

export async function build404() {
    //Render the custom 404 just if exist
    if (phyre404?.useCustom404 && fs.existsSync(join(userDir, phyre404.custom404Path))) {
        const _404Path = phyre404.custom404Path;

        entryPoints = join(userDir, _404Path);    
    } else {
        if (phyre404?.useCustom404) console.warn('To load a custom 404 page u must provide a path in phyre.config')
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