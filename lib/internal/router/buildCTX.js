import esbuild from 'esbuild';
import { join } from 'node:path';
import { ignoreCSSPlugin } from '../plugins/ignoreCss.js';
import { routesRebuild } from '../plugins/ctx/routesRebuild.js';
import { build404 } from './utils/404/build404.js';
import { getPublicEnvs } from '../env/getPublicEnvs.js';
import { envValidationPlugin } from '../plugins/envValidation.js';

export async function buildCTX(userDir, wsClients) {
    const routesCTX = await esbuild.context({
        entryPoints: [join(userDir, '.phyre/routes/import-routes.jsx')],
        bundle: true,
        platform: 'node',
        jsx: 'automatic',
        format: 'esm',
        external: [
            'react',
            'react-dom',
            'react-router'
        ],
        define: {
            'process.env.NODE_ENV': '"development"',
            ...getPublicEnvs(),
        },
        outfile: join(userDir, '.phyre/routes/routes-compiled.js'),
        plugins: [
            envValidationPlugin,
            ignoreCSSPlugin,  
            routesRebuild(wsClients),
            {
                name: '_404Builder',
                setup(build) {
                    build.onStart(async () => {
                        await build404();
                    })
                }
            }
        ]
    });

    await routesCTX.rebuild();

    await routesCTX.watch(); 
}