import { ModuleKey } from "../../../../types/api_routes.js";

export function isModuleKey(key: string): key is ModuleKey {
    return key === 'config' ||
        ['get', 'post', 'put', 'patch', 'delete'].includes(key.toLowerCase());
}