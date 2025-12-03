const extractEnvUsage = (code) => {
    const regex = /process\.env\.([A-Z][A-Z0-9_]*)/g;
    const matches = [...code.matchAll(regex)];
    return [...new Set(matches.map(m => m[1]))];
}

export const envValidationPlugin = {
    name: 'env-validation',
    setup(build) {
        const reportedVars = new Set();

        build.onLoad({ filter: /\.(jsx|tsx|js|ts)$/ }, async (args) => {
            if (args.path.includes('node_modules')) {
                return null; 
            }
            
            if (args.path.includes('.phyre')) {
                return null;
            }

            const fs = await import('fs/promises');
            const contents = await fs.readFile(args.path, 'utf-8');

            const usedVars = extractEnvUsage(contents);

            const missing = [];
            const notPublic = [];

            for (const varName of usedVars) {
                if (reportedVars.has(varName)) continue;
                
                const builtinVars = ['NODE_ENV', 'PATH', 'HOME', 'USER'];
                if (builtinVars.includes(varName)) continue;

                if (!process.env[varName]) {
                    missing.push(varName);
                    reportedVars.add(varName);
                } else if (!varName.startsWith('PUBLIC_')) {
                    notPublic.push(varName);
                    reportedVars.add(varName);
                }
            }

            if (missing.length > 0) {
                const warnings = missing.map(v => 
                    `âš ï¸  Variable "process.env.${v}" is used but not defined in .env`
                );

                console.warn('\n' + warnings.join('\n'));
                console.warn(`  Add to .env ${missing.join('=...\n   ')}\n`)
            }

            if (notPublic.length > 0) {
                const warnings = notPublic.map(v => 
                    `âš ï¸   Using process.env.${v} in client-side code will expose the variable.`
                        
                );

                console.warn('\n' + warnings.join('\n'));
                console.warn(`If this is the intended behavior, rename it to: ${notPublic.map(v => `PUBLIC_${v}`).join('\n   ')}\n`);
            }

            return { contents, loader: 'default' };
        });
    }
}