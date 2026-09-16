import * as contentLib from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('index.html');

interface Entry {
    name: string;
    displayName: string;
    url: string;
}

export const GET = function (req: Request) {
    // XP 8.1: parent restricts the query to the direct children, and returns has each hit carry
    // named index fields instead of the whole content.
    const result = contentLib.query({
        parent: '/libraries',
        count: -1,
        returns: ['_name', 'displayName']
    });

    const base = req.path.replace(/\/$/, '');

    const entries: Entry[] = result.hits.map((hit) => {
        const fields = (hit as {fields?: Record<string, string>}).fields ?? {};
        return {
            name: fields._name ?? '',
            displayName: fields.displayName ?? fields._name ?? '',
            url: base + '/' + (fields._name ?? '')
        };
    });

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            entries,
            hasEntries: entries.length !== 0,
            total: result.total
        })
    };
};
