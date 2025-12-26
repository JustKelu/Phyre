import { RequestHandler } from "express";

export interface Routes {
    filePath: string;
    routePath: string;
}

export interface ApiRoute {
    path: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    handler: RequestHandler,
    middleware?: [RequestHandler],
}

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ModuleKey = HttpMethods | 'config';