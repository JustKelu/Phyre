import { config } from 'dotenv';
config();
import esbuild from 'esbuild';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { getPublicEnvs } from './internal/env/getPublicEnvs.js';
import { envValidationPlugin } from './internal/plugins/envValidation.js';
import { postcssPlugin } from './internal/plugins/postcss.js';
import { clientRebuild } from './internal/plugins/ctx/clientRebuild.js';

import { buildCTX } from './internal/router/buildCTX.js';
import { scanner } from './internal/router/route-scanner.js';

import { serverRebuild } from './internal/plugins/ctx/serverRebuild.js';
import { startWebSocketServer } from './internal/server/startWebSocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userDir = process.cwd();

let wsClients = new Set();
let serverProcess = { state: null };

async function dev() {
    startWebSocketServer(wsClients);

    scanner();
    await buildCTX(userDir, wsClients);

    const clientCTX = await esbuild.context({
        entryPoints: [join(userDir, 'app/index.jsx')],
        jsx: 'automatic',
        bundle: true,
        format: 'esm',
        outdir: join(userDir, '.phyre/public'),
        define: getPublicEnvs(),
        plugins: [
            envValidationPlugin,
            postcssPlugin(userDir, false),
            clientRebuild(wsClients)
        ]
    });

    const serverCTX = await esbuild.context({
        entryPoints: [join(__dirname, 'internal/server/server-template.js')],
        jsx: 'automatic',
        bundle: true,
        platform: 'node',
        format: 'esm',
        external: [
            'react',
            'react-dom',
            'ws',
            'express',
            'dotenv'
        ],
        outfile: join(userDir, '.phyre/server.js'),
        plugins: [serverRebuild(serverProcess)]
    });

    await clientCTX.watch();  
    await serverCTX.watch();
}

dev();