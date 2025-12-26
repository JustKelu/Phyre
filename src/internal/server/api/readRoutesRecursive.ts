import fs from "fs";
import { join } from "path";
import { Routes } from "../../../types/api_routes.js";
import { convertFilePathToRoute } from "./utils/convertFilePathToRoute.js";

export function readRoutesRecursive(dir: string, basePath: string = ''): Routes[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const routes: Routes[] = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            const folderName = entry.name;
            const newBasePath = `${basePath}/${folderName}`;
            const subRoutes = readRoutesRecursive(fullPath, newBasePath);
            routes.push(...subRoutes);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
            const routePath = convertFilePathToRoute(basePath, entry.name);
            routes.push({
                filePath: fullPath,
                routePath
            });
        }
    }
    return routes;
}