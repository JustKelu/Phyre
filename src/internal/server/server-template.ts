import { config } from 'dotenv';
config();
import express, {type Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import { loadRoutes } from './api-router.js'
import { globalsMiddleware } from './globals-middleware.js';
import { generateMetaTagsHTML } from './generateMetaTagsHTML.js';

import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { PhyreConfig } from '../../types/routes.js';

const userDir = process.cwd();

//Importing the packages structure config
const require = createRequire(import.meta.url);
const configPath = resolve(userDir, 'phyre.config.js');

const phyreConfig: PhyreConfig | undefined = require(configPath);
const phyrePackages = phyreConfig ? phyreConfig.monorepo : undefined;

const app = express();

try {
    const middlewares = await globalsMiddleware();
    if (middlewares && Array.isArray(middlewares)) {
        middlewares.forEach(middle => app.use(middle));
    }
} catch (err) {
    console.warn('Warning, could not load global middlewares:', (err as Error).message);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(join(userDir, '.phyre/public')));
app.use('/assets', express.static(join(userDir, 'assets')));

const apiRouter = express.Router();

if (phyrePackages?.usePackStructure && phyrePackages.packages) {
    for (const pkg of phyrePackages.packages) {
        const pkgApi = await loadRoutes(`packages/${pkg.name}/src/server/api`);
        apiRouter.use(pkg.prefix, pkgApi);
    }
} else {
    const appApi = await loadRoutes();
    apiRouter.use('', appApi);
}

app.use('/api', apiRouter);

const routerPath = join(userDir, '.phyre/routes/index.js');
const routerUrl = `file://${routerPath}?t=${Date.now()}`;
const { router } = await import(routerUrl);
app.use(router);

const WSS_PORT = process.env.WSS_PORT || 3001 

type ServerRequest = Request & {
    // Runtime data from generated router code - typing not feasible
    html: string;
    routerContext: any;
    metaTags: any;
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const template = await fs.readFile(join(userDir, 'index.html'), 'utf-8');
    
        const { html, routerContext, metaTags } = req as ServerRequest;

        const hydrationScript = routerContext 
            ? `<script>window.__ROUTER_CONTEXT__ = ${JSON.stringify(routerContext)};</script>`
            : '';

        const metaTagsHTML = generateMetaTagsHTML(metaTags || []);

        const render = template
            .replace('<!--META_TAGS-->', metaTagsHTML)
            .replace(
                /<div id="root">.*?<\/div>/s,
                `<div id="root">${html}</div>`
            )
            .replace('</head>',
                `<link rel="stylesheet" href="/public/index.css">
                </head>`
            )
            .replace('</body>',
                `
                ${hydrationScript}
                <script type="module" src="/public/index.js"></script>
                <script>
                    const ws = new WebSocket('ws://localhost:${WSS_PORT}');
                    ws.onopen = () => console.log("HMR Connected");
                    ws.onmessage = (event) => {
                        if (event.data) {
                            const data = JSON.parse(event.data);
                            if (data?.type === 'reload') location.reload();
                        }
                    };
                    ws.onclose = () => console.log("HMR Disconnected");
                </script>
                </body>`
            );
        return res.send(render);
    } catch (err) {
        next(err);
    }
});

const customErrorHandler = phyreConfig ? phyreConfig.errorHandler : undefined;

if (customErrorHandler?.useCustomHandler) { 
    try {
        const configPath = resolve(userDir, customErrorHandler.customHandlerPath);
        const { errorHandler } = require(configPath);
        app.use(errorHandler);
    } catch (err) {
        console.error("Error to load custom errorHandler:", err);
    }
} else {

}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));