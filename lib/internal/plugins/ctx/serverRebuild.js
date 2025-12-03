import { join } from 'node:path';
import { spawn } from 'node:child_process';

const userDir = process.cwd();

export const serverRebuild = (serverProcess) => {
    return {
        name: 'server-rebuild',
        setup(build) {
            build.onEnd(() => {
                console.log('Server rebuilt');

                if (serverProcess.state) {
                    serverProcess.state.kill();
                };

                serverProcess.state = spawn('node', [join(userDir, '.phyre/server.js')], {
                    stdio: 'inherit'
                });
            });
        }
    };
};