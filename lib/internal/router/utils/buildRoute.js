import { buildName } from "./buildName.js";
import { buildPath } from "./buildPath.js";

export function buildRoute(file, parentPath, prefix = '', pathPackPrefix = '', isRoot = false) {
    let name = buildName(file);
    let path = buildPath(file, parentPath);

    prefix = prefix?.startsWith('/') 
        ? prefix.slice(1) 
        : prefix;
    
    // Apply package prefix only to root-level routes
    if (isRoot && prefix) {
        prefix = prefix.startsWith('/') ? prefix.slice(1) : prefix;
        path = `${prefix}/${path}`;
    }
    
    return `{
        path: '${path}',
        Component: ${pathPackPrefix}${name}Element.default,
        loader: ${pathPackPrefix}${name}Element?.loader,
        meta: ${pathPackPrefix}${name}Element?.meta,
        ErrorBoundary: ${pathPackPrefix}${name}Element?.onError,
    },`;
}