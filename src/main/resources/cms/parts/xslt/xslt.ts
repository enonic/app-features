import * as xsltLib from '/lib/xslt';
import type {Request} from '@enonic-types/core';

type Case = 'basic' | 'detail' | 'params' | 'escape' | 'error';

const CASES: Case[] = ['basic', 'detail', 'params', 'escape', 'error'];

const FRUITS = [
    {name: 'Apple', color: 'Red'},
    {name: 'Pear', color: 'Green'},
    {name: 'Banana', color: 'Yellow'},
    {name: 'Plum', color: 'Purple'}
];

function renderBasic(): string {
    const view = resolve('list.xsl');
    return xsltLib.render(view, {
        title: 'Fruit list',
        fruits: FRUITS
    });
}

function renderDetail(): string {
    const view = resolve('detail.xsl');
    return xsltLib.render(view, {
        title: 'Fruit detail',
        fruits: FRUITS
    });
}

function renderParams(req: Request): string {
    const view = resolve('params.xsl');
    const p = req.params;
    const greeting = (p.greeting as string) || 'Hello';
    const who = (p.who as string) || 'World';
    const repeatRaw = parseInt((p.repeat as string) || '3', 10);
    const repeat = !isNaN(repeatRaw) && repeatRaw > 0 && repeatRaw < 20 ? repeatRaw : 3;
    return xsltLib.render(view, {
        params: {greeting, who, repeat}
    });
}

function renderEscape(): string {
    const view = resolve('escape.xsl');
    return xsltLib.render(view, {
        title: 'Escaping & special <chars>',
        samples: [
            {label: 'ampersand', value: 'Fish & Chips'},
            {label: 'angle brackets', value: '<script>alert(1)</script>'},
            {label: 'quotes', value: 'She said "hi" & waved'},
            {label: 'apostrophes', value: "It's 5 o'clock"}
        ]
    });
}

function renderError(): {output: string; message: string} {
    const view = resolve('broken.xsl');
    try {
        const output = xsltLib.render(view, {anything: 'here'});
        return {output, message: ''};
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return {
            output: '<div class="xslt-error-fallback">Fallback rendered because the stylesheet failed.</div>',
            message
        };
    }
}

function pickCase(req: Request): Case {
    const c = (req.params.case as string) || 'basic';
    return (CASES as string[]).indexOf(c) >= 0 ? c as Case : 'basic';
}

function renderCase(kind: Case, req: Request): {body: string; note: string} {
    switch (kind) {
        case 'basic':
            return {body: renderBasic(), note: 'Basic model -> HTML transform via list.xsl.'};
        case 'detail':
            return {body: renderDetail(), note: 'Same data, structurally different stylesheet (detail.xsl).'};
        case 'params':
            return {body: renderParams(req), note: 'Query params flow into the XSLT via the model (params.xsl).'};
        case 'escape':
            return {body: renderEscape(), note: 'Special chars in model text are escaped by the transformer.'};
        case 'error': {
            const {output, message} = renderError();
            return {body: output, note: 'Broken stylesheet caught and reported: ' + message};
        }
    }
}

function renderPage(active: Case, rendered: {body: string; note: string}): string {
    const nav = CASES.map((c) => {
        const cls = c === active ? 'xslt-nav-item xslt-nav-active' : 'xslt-nav-item';
        return `<a class="${cls}" href="?case=${c}">${c}</a>`;
    }).join(' | ');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>lib-xslt demo</title>` +
        `<style>
            .xslt-demo { font-family: sans-serif; margin: 1em; }
            .xslt-nav { margin-bottom: 1em; }
            .xslt-nav-active { font-weight: bold; text-decoration: underline; }
            .xslt-note { color: #555; font-style: italic; margin-bottom: 1em; }
            .xslt-output { border: 1px solid #ccc; padding: 1em; background: #fafafa; }
        </style>` +
        `</head><body>` +
        `<div class="xslt-demo">` +
        `<h1>lib-xslt demo</h1>` +
        `<nav class="xslt-nav">${nav}</nav>` +
        `<p class="xslt-note">Case: <span class="xslt-case-name">${active}</span>. ${rendered.note}</p>` +
        `<section class="xslt-output" data-case="${active}">${rendered.body}</section>` +
        `</div></body></html>`;
}

export const GET = function (req: Request) {
    const active = pickCase(req);
    const rendered = renderCase(active, req);
    return {
        contentType: 'text/html',
        body: renderPage(active, rendered)
    };
};
