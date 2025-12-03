export const generateMetaTagsHTML = (metaTags) => {
    return metaTags?.map(tag => {
        if (tag.title) {
            return `<title>${escapeHtml(tag.title)}</title>`
        }

        if (tag.tagName === 'link') {
            const attrs = Object.entries(tag)
                .filter(([key]) => key !== 'tagName')
                .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
                .join(' ');

            return `<link ${attrs} />`
        }

        const attrs = Object.entries(tag)
            .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
            .join(' ');
        
        return `<meta ${attrs} />`
    }).join('\n'); 
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')   // Prima, per non re-escape
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}