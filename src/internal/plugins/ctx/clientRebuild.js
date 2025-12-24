export const clientRebuild = (wsClients) => {
    return {
        name: 'client-rebuild',
        setup(build) {
            build.onEnd(() => {
                console.log('Client rebuilt');

                wsClients?.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify(
                            { type: 'reload' }
                        ));
                    }
                })
            })
        }
    }
}