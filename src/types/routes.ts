export interface RouteComponent {
    name: string;
}
export interface RouteTree {
    path: string;
    component: RouteComponent;
    children?: Array<RouteTree | string>;
}

export interface BuildResult {
    imports: string;
    exports: string;
}

export interface BuildOptions {
    prefix?: string;
    path: string;
    isRoot?: boolean;
}

export interface PhyrePackage {
    name: string;
    prefix: string;
}

export interface PhyreConfig {
    monorepo?: {
        usePackStructure?: boolean;
        packages?: PhyrePackage[];
    }
    errorHandler?: {
        useCustomHandler?: boolean
        customHandlerPath: string
    }
    _404?: {
        useCustom404?: boolean
        custom404Path: string
    }
}