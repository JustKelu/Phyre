import { config } from 'dotenv';
config();
import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { loadRoutes } from './api/loadRoutes.js'
import { globalsMiddleware } from './utils/globals-middleware.ts';
import { generateMetaTagsHTML } from './utils/generateMetaTagsHTML.ts';

import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const userDir = process.cwd();
const isProduction = process.env.NODE_ENV === 'production';

//Importing the packages structure config
const require = createRequire(import.meta.url);
const configPath = resolve(userDir, isProduction ? 'phyre.config.js' : 'phyre.config.js');

let phyreConfig;
try {
    phyreConfig = require(configPath);
} catch (err) {
    console.error("Error to load phyre config:", err);
}

const phyrePackages = phyreConfig?.default;

const app = express();

try {
    const middlewares = await globalsMiddleware();
    if (middlewares && Array.isArray(middlewares)) {
        middlewares.forEach(middle => app.use(middle));
    }
} catch (err) {
    console.warn('⚠️  Could not load global middlewares:', err.message);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = isProduction 
    ? join(userDir, 'dist/public')
    : join(userDir, '.phyre/public');

app.use('/public', express.static(publicDir));
app.use('/assets', express.static(join(userDir, 'assets')));

const apiRouter = express.Router();

if (phyrePackages?.packagesStructure) {
    for (const pkg of phyrePackages.packages) {
        const pkgApi = await loadRoutes(`packages/${pkg.name}/src/server/api`);
        apiRouter.use(pkg.prefix, pkgApi);
    }
} else {
    const appApi = await loadRoutes();
    apiRouter.use('', appApi);
}

app.use('/api', apiRouter);

// Load routes from correct directory
const routerPath = isProduction 
    ? join(userDir, 'dist/routes/index.js')
    : join(userDir, '.phyre/routes/index.js');

const routerUrl = `file://${routerPath}${isProduction ? '' : `?t=${Date.now()}`}`;
const { router } = await import(routerUrl);
app.use(router);

app.use(async (req, res, next) => {
    try {
        const templatePath = isProduction
            ? join(userDir, 'dist/index.html')
            : join(userDir, 'index.html');
            
        const template = await fs.readFile(templatePath, 'utf-8');
    
        let appHTML = req.html;
        let routerContext = req.routerContext;

        const hydrationScript = routerContext 
            ? `<script>window.__ROUTER_CONTEXT__ = ${JSON.stringify(routerContext)};</script>`
            : '';

        const metaTagsHTML = generateMetaTagsHTML(req.metaTags || []);

        // Check if CSS file exists
        const cssPath = join(publicDir, 'index.css');
        const cssLink = existsSync(cssPath) 
            ? '<link rel="stylesheet" href="/public/index.css">'
            : '';

        // HMR script only in development
        const hmrScript = !isProduction 
            ? `
                <script>
                    const ws = new WebSocket('ws://localhost:3001');
                    ws.onopen = () => console.log("HMR Connected");
                    ws.onmessage = (event) => {
                        if (event.data) {
                            const data = JSON.parse(event.data);
                            if (data?.type === 'reload') location.reload();
                        }
                    };
                    ws.onclose = () => console.log("HMR Disconnected");
                </script>
            `
            : '';

        const render = template
            .replace('<!--META_TAGS-->', metaTagsHTML)
            .replace(
                /<div id="root">.*?<\/div>/s,
                `<div id="root">${appHTML}</div>`
            )
            .replace('</head>', `${cssLink}</head>`)
            .replace('</body>',
                `
                ${hydrationScript}
                <script type="module" src="/public/index.js"></script>
                ${hmrScript}
                </body>`
            );
        return res.send(render);
    } catch (err) {
        next(err);
    }
});

// Error handler
if (phyreConfig?.errorHandler?.customHandler) { 
    const configPath = resolve(userDir, phyreConfig.errorHandler.customHandlerPath);
    try {
        const { errorHandler } = require(configPath);
        app.use(errorHandler);
    } catch (err) {
        console.error("Error to load custom errorHandler:", err);
    }
} else {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ 
            error: isProduction ? 'Internal Server Error' : err.message 
        });
    });
}

const PORT = process.env.PORT || 3000;
const HOST = isProduction ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
    if (isProduction) {
        console.log('Running in PRODUCTION mode');
    } else {
        console.log('Running in DEVELOPMENT mode');
    }
});