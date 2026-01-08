import { describe, it, expect } from "vitest";
import { generateMetaTagsHTML } from '../../../../src/internal/server/utils/generateMetaTagsHTML.ts';

describe('generateMetaTagsHTML', () => {
    it('Should generate a meta tag', () => {
        const result = generateMetaTagsHTML([
            { name: 'description', content: 'Learn more about our company' }
        ]);

        expect(result).toEqual('<meta name="description" content="Learn more about our company" />');
    });

    it('Should generate a title tag', () => {
        const result = generateMetaTagsHTML([
            { title: 'WebSite' }
        ]);

        expect(result).toEqual('<title>WebSite</title>');
    });

    it('Should generate a link tag', () => {
        const result = generateMetaTagsHTML([
            {
                tagName: 'link',
                rel: 'icon',
                href: 'https://path/to/my/icon'
            }
        ]);

        expect(result).not.toContain('tagName=')
        expect(result).toEqual('<link rel="icon" href="https://path/to/my/icon" />');
    });

    it('Should generate a complete list of meta tags', () => {
        const result = generateMetaTagsHTML([
            { title: 'WebSite' },
            { name: 'description', content: 'Learn more about our company' },
            {
                tagName: 'link',
                rel: 'icon',
                href: 'https://path/to/my/icon'
            }
        ]);

        expect(result).toEqual('<title>WebSite</title>\n<meta name="description" content="Learn more about our company" />\n<link rel="icon" href="https://path/to/my/icon" />');
    });

    it('Should handle an empty array', () => {
        const result = generateMetaTagsHTML([]);

        expect(result).toEqual('');
    });

    it('Should escape XSS', () => {
        const result = generateMetaTagsHTML([
            { title: "<script>alert('Malicious String')</script>" },
        ]);

        expect(result).toEqual('<title>&lt;script&gt;alert(&#x27;Malicious String&#x27;)&lt;/script&gt;</title>');
    });
});