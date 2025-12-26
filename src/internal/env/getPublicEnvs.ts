interface publicEnv {
    [key: string]: string;
}

export const getPublicEnvs = (): publicEnv => {
    const publicVars: publicEnv = {};

    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('PUBLIC_')) {
            publicVars[`process.env.${key}`] = JSON.stringify(value)
        }
    }

    return publicVars;
}