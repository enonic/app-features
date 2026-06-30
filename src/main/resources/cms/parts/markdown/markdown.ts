import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as markdown from '/lib/markdown';
import type {Request} from '@enonic-types/core';

const SAMPLE = [
    '# Markdown Lib Demo',
    '',
    'This part renders a sample document through `com.enonic.lib:lib-markdown`.',
    '',
    '## Features',
    '',
    '- **Bold**, *italic* and `inline code`',
    '- Ordered and unordered lists',
    '- [Links](https://developer.enonic.com)',
    '',
    '## Code block',
    '',
    '```javascript',
    "var lib = require('/lib/markdown');",
    "lib.render('Hello **World**');",
    '```',
    '',
    '> Block quotes work too.',
    ''
].join('\n');

export const GET = function (req: Request) {
    return renderPage(SAMPLE);
};

export const POST = function (req: Request) {
    const source = (req.params.source as string) ?? SAMPLE;
    return renderPage(source);
};

function renderPage(source: string) {
    const params = {
        postUrl: portal.componentUrl({}),
        source: source,
        rendered: markdown.render(source)
    };

    const view = resolve('markdown.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}
