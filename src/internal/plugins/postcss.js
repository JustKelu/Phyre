// internal/plugins/postcss.js
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import path from 'path';

export function postcssPlugin(userDir, isProduction = false) {
    return {
        name: 'postcss-tailwind',
        setup(build) {
            build.onLoad({ filter: /\.css$/ }, async (args) => {
                const css = await fs.readFile(args.path, 'utf-8');

                const contentPaths = isProduction 
                    ? [
                        path.join(userDir, 'dist/public/**/*.js'),
                        path.join(userDir, 'dist/routes/**/*.js'),
                        path.join(userDir, 'dist/index.html'),
                        // Also scan source as backup
                        path.join(userDir, 'app/**/*.{js,jsx}'),
                        path.join(userDir, 'src/**/*.{js,jsx}'),
                      ]
                    : [
                        path.join(userDir, 'src/**/*.{js,jsx,ts,tsx}'),
                        path.join(userDir, 'app/**/*.{js,jsx,ts,tsx}'),
                        path.join(userDir, '.phyre/routes/**/*.{js,jsx}'),
                        path.join(userDir, 'index.html')
                      ];

                const tailwindConfig = {
                    content: contentPaths,
                    theme: {
                        extend: {}
                    }
                };

                const processor = postcss([
                    tailwindcss(tailwindConfig),
                    autoprefixer
                ]);

                const result = await processor.process(css, {
                    from: args.path,
                    to: args.path
                });

                return {
                    contents: result.css,
                    loader: 'css'
                };
            });
        }
    }
}