export const ignoreCSSPlugin = {
    name: 'ignore-css',
    setup(build) {
        build.onResolve({ filter: /\.css$/ }, (args) => {
            return {
                path: args.path,
                namespace: 'ignore-css'
            };
        });
        
        build.onLoad({ filter: /.*/, namespace: 'ignore-css' }, () => {
            return {
                contents: 'export default {};',
                loader: 'js'
            };
        });
    }
};