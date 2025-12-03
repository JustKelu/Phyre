import { wrapRouter } from '../../router/route-wrapper.js';

export const routesRebuild = (wsClients) => {
    return {
        name: 'routes-rebuild',
        setup(build) {
            build.onEnd(() => {
                console.log('âœ… Routes compiled');
                wrapRouter();
                wsClients?.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify(
                            { type: 'reloadRoutes' }
                        ));
                    }
                })
            });
        }
    }
}