// Runtime data from generated router code - typing not feasible
export const generateMetaTagsHTML = (metaTags: any) => {
    return metaTags?.map((tag: any) => {
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

function escapeHtml(text: unknown) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}