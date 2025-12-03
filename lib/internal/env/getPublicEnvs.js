export const getPublicEnvs = () => {
    const publicVars = {};

    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('PUBLIC_')) {
            publicVars[`process.env.${key}`] = JSON.stringify(value)
        }
    }

    return publicVars;
}