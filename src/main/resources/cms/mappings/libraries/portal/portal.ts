import * as contentLib from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('portal.html');

export function GET(req: Request) {
    const result = contentLib.query({
        parent: '/libraries/portal',
        count: -1,
        returns: ['_name', 'displayName']
    });
    const base = req.path.replace(/\/$/, '');
    const entries = result.hits.map((hit) => {
        const fields = (hit as {fields?: Record<string, string>}).fields ?? {};
        return {
            displayName: fields.displayName ?? fields._name ?? '',
            url: base + '/' + (fields._name ?? '')
        };
    });
    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            entries,
            hasEntries: entries.length !== 0,
            backUrl: base.replace(/\/[^/]*$/, '/')
        })
    };
}
