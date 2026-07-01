import * as thymeleaf from '/lib/thymeleaf';
import * as markdown from '/lib/markdown';
import type {Request} from '@enonic-types/core';

interface DemoCase {
    key: string;
    title: string;
    description?: string;
    source: string;
}

const LARGE_DOC = [
    '# Library reference',
    '',
    '*A multi-section example used to verify large input does not break the renderer.*',
    '',
    '## Section 1 — Introduction',
    '',
    'Paragraph one with a [link](https://example.com) and an autolink: <https://enonic.com>.',
    '',
    '## Section 2 — Lists',
    '',
    '1. First',
    '2. Second',
    '   - nested',
    '3. Third',
    '',
    '## Section 3 — Code',
    '',
    '```bash',
    'curl -s http://localhost:8080/site/default/draft/features/markdown',
    '```',
    '',
    '## Section 4 — Quote',
    '',
    '> A closing block quote.',
    ''
].join('\n');

const CASES: DemoCase[] = [
    {
        key: 'headings',
        title: 'Headings (ATX and Setext)',
        source: [
            '# H1 ATX heading',
            '## H2 ATX heading',
            '### H3 ATX heading',
            '',
            'Setext H1 heading',
            '=================',
            '',
            'Setext H2 heading',
            '-----------------'
        ].join('\n')
    },
    {
        key: 'emphasis',
        title: 'Emphasis: bold, italic, and inline code',
        source: '**MD_BOLD**, *MD_ITAL*, ***MD_BOTH*** and `MD_CODE()`.'
    },
    {
        key: 'lists',
        title: 'Lists: ordered, unordered, nested',
        source: [
            '- alpha',
            '- beta',
            '  - beta one',
            '  - beta two',
            '    1. ordered nested',
            '    2. second ordered',
            '- gamma'
        ].join('\n')
    },
    {
        key: 'code-block-lang',
        title: 'Fenced code block with language hint',
        source: [
            '```javascript',
            "var lib = require('/lib/markdown');",
            "lib.render('MD_FENCE');",
            '```'
        ].join('\n')
    },
    {
        key: 'links',
        title: 'Links, autolinks, and images',
        source:
            'A [MD_LINK](https://example.com), an autolink <https://enonic.com> ' +
            'and an image ![MD_IMG](/p.png "MD_TITLE").'
    },
    {
        key: 'block-quote',
        title: 'Block quote (nested)',
        source: [
            '> outer quote line',
            '> > nested quote line'
        ].join('\n')
    },
    {
        key: 'gfm-table',
        title: 'GFM table — CommonMark passthrough',
        description:
            'lib-markdown 2.0.0 wires plain CommonMark-Java with no GFM extensions, ' +
            'so a pipe table is rendered as a paragraph instead of an HTML <table>.',
        source: [
            '| MD_COL1 | MD_COL2 |',
            '| ------- | ------- |',
            '| MD_VAL1 | MD_VAL2 |'
        ].join('\n')
    },
    {
        key: 'gfm-tasklist',
        title: 'GFM task list — CommonMark passthrough',
        description:
            'Without the task-list-items extension the brackets stay literal inside the list item.',
        source: [
            '- [x] MD_TASK_DONE',
            '- [ ] MD_TASK_TODO'
        ].join('\n')
    },
    {
        key: 'gfm-strike',
        title: 'GFM strikethrough — CommonMark passthrough',
        description:
            'Tildes are kept literal because the strikethrough extension is not enabled.',
        source: 'A ~~MD_STRIKE~~ word.'
    },
    {
        key: 'raw-html',
        title: 'Raw HTML passthrough (no sanitization)',
        description:
            'CommonMark forwards raw block-level HTML unchanged; the renderer is not configured ' +
            'with escapeHtml(true), so attributes and tags survive.',
        source: [
            '<div class="MD_RAW_HTML">',
            '  <span style="color: red;">MD_RAW_INNER</span>',
            '</div>'
        ].join('\n')
    },
    {
        key: 'hrule',
        title: 'Horizontal rule',
        source: [
            'paragraph above',
            '',
            '---',
            '',
            'paragraph below'
        ].join('\n')
    },
    {
        key: 'linebreak',
        title: 'Hard line break via trailing backslash',
        description: 'A trailing backslash forces a <br /> within a paragraph.',
        source: 'MD_LINEBREAK_A\\\nMD_LINEBREAK_B'
    },
    {
        key: 'empty',
        title: 'Empty input',
        description: 'The render function returns an empty string and does not throw.',
        source: ''
    },
    {
        key: 'large',
        title: 'Large multi-section document',
        description: 'Exercises multiple constructs together to verify the renderer handles non-trivial input.',
        source: LARGE_DOC
    }
];

function buildRenderedCases() {
    return CASES.map(c => ({
        key: c.key,
        title: c.title,
        description: c.description || '',
        hasDescription: !!c.description,
        source: c.source,
        rendered: markdown.render(c.source)
    }));
}

export const GET = function (req: Request) {
    const params = {
        cases: buildRenderedCases()
    };

    const view = resolve('markdown.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
