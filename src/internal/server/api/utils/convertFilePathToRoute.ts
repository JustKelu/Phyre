export function convertFilePathToRoute(basePath: string, fileName: string): string {
    let name: string = fileName.replace(/\.(js|ts)$/, '');
    name = name === "index" ? "" : name;

    const converted: string = name.replace(/\[(\w+)]/g, ':$1');

    let fullPath: string = converted ? `${basePath}/${converted}` : basePath;

    fullPath = fullPath.replace(/\/+/g, '/');

    return fullPath || '/';
}