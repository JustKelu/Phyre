import fsSync from "fs";
import { readFiles } from "./utils/readFiles.js";
import { buildRouter } from "./buildRouter.js";
import { formatCode } from "./utils/formatCode.js";
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

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

export function routeScanner () {
    const phyrePackages = phyreConfig.default;

    let imp = '';
    let exp = 'export const routes = [';

    if (phyrePackages.packagesStructure) {
        const packages = phyrePackages.packages;

        for (const pack of packages) {
            const path = `packages/${pack.name}/src/client/routes`;
            const files = readFiles(path, userDir);

            const { imports, exports } = buildRouter(files, path, pack.prefix);
            
            imp += `${imports}\n`
            exp += `${exports}`
        }
    } else {
        const path = 'src/client/routes';
        const files = readFiles(path, userDir);

        const { imports, exports } = buildRouter(files, path);

        imp += imports;
        exp += exports;
    }

    exp += ']';
    const final = formatCode(`${imp}\n${exp}`);      
    const outdir = join(userDir, '.phyre/routes');

    !fsSync.existsSync(outdir) ? fsSync.mkdirSync(outdir, { recursive: true }) : null;
    fsSync.writeFileSync(join(outdir, 'import-routes.jsx'), final);
}