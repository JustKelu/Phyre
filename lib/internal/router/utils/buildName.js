export const buildName = (file, pack = '') => {
    return `${pack ? pack + '_' : ''}${file
        ?.replace(/\.(jsx|tsx)$/, '')
        ?.replace(/^\//, '')
        ?.replace(/[\/\\]/g, '_')
        ?.replace(/\[(\w+)\]/, '$1')
        ?.replace(/\w+/, (_) => _[0].toUpperCase() + _.slice(1))}`;
}   