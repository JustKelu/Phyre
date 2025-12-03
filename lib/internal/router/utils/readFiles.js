import { join } from "path";
import fsSync from "fs";

export const readFiles = (dirPath, basePath, currentPrefix = "") => {
    const fullPath = join(basePath, dirPath);
    const entries = fsSync.readdirSync(fullPath, { withFileTypes: true });
    const layout = entries.find(entry => /\_layout\.(jsx|tsx)$/i.test(entry.name));

    const files = []

    for (const entry of entries) {
        //Skipping dotfile like '.jsx'
        if (entry.name.startsWith('.')) continue;
        if (/\_layout\.(jsx|tsx)$/i.test(entry.name)) continue;

        if (entry.isDirectory()) {
            const newPrefix = currentPrefix 
                ? `${currentPrefix !== '/' ? currentPrefix : ''}/${entry.name}` 
                : entry.name;

            const nested = readFiles(`${dirPath}/${entry.name}`, basePath, newPrefix);
            files.push(...nested);
        } else if (entry.isFile()) {
            files.push(`${currentPrefix}/${entry.name}`);
        }
    }
    if (layout) {
        return [{
            path: currentPrefix,
            component: layout,
            children: files
        }]
    }

    return files;
}