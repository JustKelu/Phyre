import fs from 'fs';
import { join } from 'node:path';

export const wrapRouter = () => {
    const userDir = process.cwd();

    const wsConnection = `
import WebSocket from 'ws';
const WSS_PORT = process.env.WSS_PORT || 3001; 

const ws = new WebSocket(\`ws://localhost:\$\{WSS_PORT\}\`);
let isReloading = false;

ws.on('message', async (message) => {
    const data = JSON.parse(message.toString());
    if (data?.type === 'reloadRoutes') {
        if (isReloading) return; // Previene reload multipli
        
        isReloading = true;
        try {
            const { routes } = await import(\`./routes-compiled.js?t=\$\{Date.now()\}\`);
            const newRrRoutes = routes.map(r => ({
                path: r.path,
                Component: r.Component,
                loader: r?.loader,
                meta: r?.meta,
                children: r.children,
                ErrorBoundary: r?.ErrorBoundary,
            }));
            
            newRrRoutes.push({path: '*', Component: _404});
            
            const newHandler = createStaticHandler(newRrRoutes);
            
            rrRoutes = newRrRoutes;
            handler = newHandler;
        } catch (err) {
            console.error('Routes reload failed:', err);
        } finally {
            isReloading = false;
        }
    }
});
` 

    const wrapper =  `import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router';
import { routes } from './routes-compiled.js';
import _404 from './404/_404Compiled.js';

const router = express.Router();

let rrRoutes = routes.map(r => ({
    path: r.path,
    Component: r.Component,
    loader: r?.loader,
    meta: r?.meta,
    children: r.children,
    ErrorBoundary: r?.ErrorBoundary,
}));

rrRoutes.push({path: '*', Component: _404})

let handler = createStaticHandler(rrRoutes);

${process.env.NODE_ENV !== 'production' ? wsConnection : ''}

router.get('/{*splat}', async (req, res, next) => {
    try {
        const context = await handler.query(
            new Request(\`http://localhost:3000\$\{req.url\}\`)
        );

        const staticRouter = createStaticRouter(handler.dataRoutes, context);
        
        let html = ReactDOMServer.renderToString(
            React.createElement(StaticRouterProvider, {
                router: staticRouter,
                context,
                hydrate: false
            })
        );

        const metaTags = extractMetaTags(context);

        req.routerContext = context;
        req.html = html;
        req.metaTags = metaTags;
        next();
    } catch (err) {
        console.error(err);
        next();
    }
});

function extractMetaTags(context) {
    const metaMap = new Map();
    
    // Itera matches (parent â†’ child order)
    for (const match of context.matches) {
        if (match.route.meta) {
            const routeId = match.route.id;
            const routeData = context.loaderData?.[routeId];
            
            try {
                const routeMeta = match.route.meta({
                    data: routeData,
                    location: context.location,
                    params: match.params,
                    matches: context.matches,
                    error: context.errors?.[routeId]
                });
                
                if (routeMeta && Array.isArray(routeMeta)) {
                    for (const tag of routeMeta) {
                        const key = getMetaKey(tag);
                        metaMap.set(key, tag);  // â† Last write wins
                    }
                }
            } catch (err) {
                console.error(\`Error calling meta() for route \${routeId}:\`, err);
            }
        }
    }
    
    return Array.from(metaMap.values());
}

function getMetaKey(tag) {
    if (tag.title) return 'title';
    
    if (tag.name) return \`meta:name:\${tag.name}\`;
    
    if (tag.property) return \`meta:property:\${tag.property}\`;
    
    if (tag.tagName === 'link' && tag.rel) return \`link:rel:\${tag.rel}\`;
    
    return JSON.stringify(tag);
}

export { router };`;

    fs.writeFileSync(join(userDir, '.phyre/routes/index.js'), wrapper);
}