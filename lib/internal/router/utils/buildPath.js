export const buildPath = (file, parentPath = '') => {
    let routePath = file.replace(/\.(jsx|tsx)$/, '');
    
    routePath = routePath.toLowerCase();

    // Handle index.jsx
    if (routePath === 'index' || routePath.endsWith('/index')) {
        routePath =  routePath
            .replace(/\/index$/, '')
            .replace(/\index$/, '');
    }

    // Handle [id] â†’ :id
    routePath = routePath.replace(/\[(\w+)\]/g, ':$1');

    if (parentPath) {
        const re = new RegExp(`${parentPath}`, "g");
        routePath = routePath.replace(re, '');
    }

    routePath = routePath.startsWith('/') ? routePath.slice(1) : routePath;

    return routePath
}