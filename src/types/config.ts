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