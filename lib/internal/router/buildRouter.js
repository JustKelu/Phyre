import { buildTree } from "./utils/buildTree.js";
import { buildRoute } from "./utils/buildRoute.js";

export function buildRouter(files, path, prefix = "") {
    let exports = '';
    let imports = ''; 

    //Prefix to build unique component for each package
    let pathPackPrefix = prefix ? prefix.replace('/', '') : '';
    pathPackPrefix = pathPackPrefix ? pathPackPrefix + '_' : pathPackPrefix;

    for (const entry of files) {
        if (typeof entry === "string") {
            exports += buildRoute(entry, '', prefix, pathPackPrefix, true);
            imports += buildTree(entry, path, prefix, pathPackPrefix).imports;
        } else if (typeof entry === "object") {
            exports += buildTree(entry, path, prefix, pathPackPrefix, true).exports;
            imports += buildTree(entry, path, prefix, pathPackPrefix, true).imports;
        }
    }

    return { imports, exports };
}