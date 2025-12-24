import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { PhyreConfig } from '../../types/routes';
import { existsSync } from 'node:fs';

const userDir = process.cwd();

const require = createRequire(import.meta.url);
const configPath = resolve(userDir, 'phyre.config.js');

export function getPhyreConfig(): PhyreConfig | undefined { 
    try {
        if (!existsSync(configPath)) {
            return undefined;
        }

        let phyreConfig: PhyreConfig = require(configPath);
        return phyreConfig;
    } catch (err) {
        console.error("Error to load phyre config:", err);
        return undefined;
    }
}