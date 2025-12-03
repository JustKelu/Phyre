import { relative, join } from 'path';
import { buildRoute } from "./buildRoute.js";
import { buildName } from "./buildName.js";

const userDir = process.cwd();

export function buildTree(tree, path, prefix = '', pathPackPrefix = '', isRoot = false) {
    const relPath = (toPath) => {
        const fullPath = join(userDir, join(path, toPath));
        return relative(userDir, fullPath).replace(/\\/g, '/');
    }

    const routePath = tree.path 
        ? tree.path
            .replace(/(\w+)\//g, '')
        : '';

    const dirPrefix = tree.path 
        ? tree.path
            .replace(/(\w+)\//g, '$1_')
            .replace(/\w+/, (_) => _[0].toUpperCase() + _.slice(1))
            + '_'
        : '';

    let layoutPath = isRoot 
        ? prefix.replace('/', '') + '/' + tree.path 
        : '' + routePath;

    const layoutName = `${pathPackPrefix}${dirPrefix}${buildName(tree?.component?.name).slice(1)}Element`;
    const componentName = (file) => `${pathPackPrefix}${buildName(file)}Element`;

    const exports = `
        {
            path: '${layoutPath}',
            Component: ${layoutName}.default,
            loader: ${layoutName}?.loader,
            meta: ${layoutName}?.meta,
            ErrorBoundary: ${layoutName}?.onError,
            children: [
                ${tree?.children?.map(c => {
                    if (c.children) {
                        console.log(c);
                        return buildTree(c, path, prefix, pathPackPrefix).exports;
                    } else {
                        return buildRoute(c, tree.path, prefix, pathPackPrefix);    
                    }  
                }).join('')}
            ],
        },
    `;

    let imports = '';
    
    if (!tree.children) {
        if (tree.startsWith('/')) tree = tree.slice(1);

        imports += `import * as ${componentName(tree)} from '../../${relPath(tree)}';`;
    } else {
        imports += `import * as ${layoutName} from '../../${relPath(tree.path)}/${tree.component.name}';`;
        imports += `
            ${tree?.children?.map(c => {
                if (c.children) {
                    return buildTree(c, path, prefix, pathPackPrefix).imports;
                } else {
                    //Import path
                    if (c.startsWith('/')) c = c.slice(1);

                    return `import * as ${componentName(c)} from '../../${relPath(c)}';`;    
                }  
            }).join('')}`
    }

    return { imports, exports };
}