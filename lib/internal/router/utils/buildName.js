export const buildName = (file, pack = '') => {
    return `${pack ? pack + '_' : ''}${file
        ?.replace(/\.(jsx|tsx)$/, '')
        ?.replace(/^\//, '')
        ?.replace(/[\/\\]/g, '_')
        ?.replace(/\[(\w+)\]/, '$1')
        ?.replace(/[^a-zA-Z0-9_]/g, '_')
        ?.replace(/_+/g, '_')
        ?.replace(/^_|_$/g, '')
        ?.replace(/\w+/, (_) => _[0].toUpperCase() + _.slice(1))}`;
}