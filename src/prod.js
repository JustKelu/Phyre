import { config } from 'dotenv';
config();

process.env.NODE_ENV = 'production';

import fsSync from 'fs';
import esbuild from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { postcssPlugin } from './internal/plugins/postcss.js';
import { getPublicEnvs } from './internal/env/getPublicEnvs.ts';
import { routeScanner } from './internal/router/route-scanner.js';
import { wrapRouter } from './internal/router/route-wrapper.js';
import { ignoreCSSPlugin } from './internal/plugins/ignoreCss.js';
import { build404 } from './internal/router/utils/404/build404.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userDir = process.cwd(); 

async function build() {
    const distDir = join(userDir, 'dist');
    if (fsSync.existsSync(distDir)) {
        fsSync.rmSync(distDir, { recursive: true });
    }
    fsSync.mkdirSync(distDir, { recursive: true });

    console.log(' Scanning routes...');
    routeScanner();  

    console.log(' Compiling routes...');
    await esbuild.build({
        entryPoints: [join(userDir, '.phyre/routes/import-routes.jsx')],
        bundle: true,
        platform: 'node',
        jsx: 'automatic',
        format: 'esm',
        minify: true,
        treeShaking: true,
        external: ['react', 'react-dom', 'react-router'],
        define: {
            'process.env.NODE_ENV': '"production"',
            ...getPublicEnvs(),
        },
        outfile: join(userDir, 'dist/routes/routes-compiled.js'),
        plugins: [ignoreCSSPlugin]
    });

    console.log(' Compiling 404 page...');
    await build404(); 
    
    const _404Source = join(userDir, '.phyre/routes/404/_404Compiled.js');
    const _404Dest = join(userDir, 'dist/routes/404/_404Compiled.js');
    fsSync.mkdirSync(join(userDir, 'dist/routes/404'), { recursive: true });
    fsSync.copyFileSync(_404Source, _404Dest);

    wrapRouter();
    
    const wrapperSource = join(userDir, '.phyre/routes/index.js');
    const wrapperDest = join(userDir, 'dist/routes/index.js');
    fsSync.copyFileSync(wrapperSource, wrapperDest);
    
    console.log(' Routes compiled');

    console.log(' Building client...');

    await esbuild.build({
        entryPoints: [join(userDir, 'app/index.jsx')],
        jsx: 'automatic',
        bundle: true,
        format: 'esm',
        minify: true,
        sourcemap: true,
        splitting: true,
        treeShaking: true,
        target: ['es2022'],  
        legalComments: 'none',
        
        outdir: join(userDir, 'dist/public'),
        
        define: {
            'process.env.NODE_ENV': '"production"',
            ...getPublicEnvs(),
        },
        
        plugins: [
            postcssPlugin(userDir, true)
        ]
    });

    console.log(' Client built');

    console.log('\n' + '='.repeat(50));
    console.log('CHECKING BUILD OUTPUT:');
    console.log('='.repeat(50));

    const distPublic = join(userDir, 'dist/public');
    console.log(`\nDirectory: ${distPublic}`);
    console.log(`Exists: ${fsSync.existsSync(distPublic)}\n`);

    if (fsSync.existsSync(distPublic)) {
        const files = fsSync.readdirSync(distPublic);
        files.forEach(file => {
            const fullPath = join(distPublic, file);
            const stats = fsSync.statSync(fullPath);
            const size = (stats.size / 1024).toFixed(2);
        });
    } else {
        console.log('dist/public directory does NOT exist!');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    console.log(' Building server...');

    await esbuild.build({
        entryPoints: [join(__dirname, 'internal/server/server-prod.js')],
        jsx: 'automatic',
        bundle: true,
        platform: 'node',
        format: 'esm',
        minify: true,
        target: 'node18',
        external: [
            'react',
            'react-dom',
            'express',
            'dotenv'
        ],
        define: {
            'process.env.NODE_ENV': '"production"',
        },
        outfile: join(userDir, 'dist/server.js')
    });

    console.log(' Server built');

    console.log(' Copying static assets...');

    if (fsSync.existsSync(join(userDir, 'index.html'))) {
        fsSync.copyFileSync(
            join(userDir, 'index.html'),
            join(userDir, 'dist/index.html')
        );
    }

    if (fsSync.existsSync(join(userDir, 'assets'))) {
        fsSync.cpSync(
            join(userDir, 'assets'),
            join(userDir, 'dist/assets'),
            { recursive: true }
        );
    }
    
    console.log('Remember to declare your env variables on your deploy environment')

    console.log('\n Build complete!\n');
    
    const getSize = (path) => {
        if (!fsSync.existsSync(path)) return '0 KB';
        const stats = fsSync.statSync(path);
        return (stats.size / 1024).toFixed(2) + ' KB';
    };

    console.log('Output:');
    console.log(`  dist/public/index.js  - ${getSize(join(userDir, 'dist/public/index.js'))}`);
    console.log(`  dist/public/index.css - ${getSize(join(userDir, 'dist/public/index.css'))}`);
    console.log(`  dist/server.js        - ${getSize(join(userDir, 'dist/server.js'))}`);
    
    console.log('\n To run production server:');
    console.log('   cd dist && node server.js\n');
}

build()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(' Build failed:', err);
        process.exit(1);
    });