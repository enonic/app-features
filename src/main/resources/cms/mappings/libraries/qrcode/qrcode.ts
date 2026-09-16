import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as qrcode from '/lib/qrcode';
import {base64Encode} from '/lib/text-encoding';
import type {ByteSource, Request} from '@enonic-types/core';

interface PresetCase {
    key: string;
    label: string;
    category: 'payload' | 'size' | 'edge';
    description: string;
    text: string;
    size: number;
}

const LONG_PAYLOAD =
    'Enonic XP is an open-source platform for building scalable web applications. ' +
    'It combines a headless CMS, a powerful runtime, and a low-code experience ' +
    'so developers can ship faster while keeping full control of code, data, and ' +
    'infrastructure. This long string exercises QR Code byte mode encoding.';

const PRESET_CASES: PresetCase[] = [
    {
        key: 'url',
        label: 'URL payload',
        category: 'payload',
        description: 'A standard https URL — the most common QR Code payload (browser deep link, marketing scan target).',
        text: 'https://enonic.com',
        size: 250
    },
    {
        key: 'text',
        label: 'Plain text payload',
        category: 'payload',
        description: 'Free-form ASCII text — encoded in alphanumeric/byte mode depending on contents.',
        text: 'Enonic XP makes content management awesome',
        size: 250
    },
    {
        key: 'long',
        label: 'Long string payload',
        category: 'payload',
        description: 'A multi-sentence paragraph (~300 chars). Forces a higher-density code and larger render size.',
        text: LONG_PAYLOAD,
        size: 400
    },
    {
        key: 'unicode',
        label: 'Unicode and emoji payload',
        category: 'payload',
        description: 'Non-ASCII characters and emoji — exercises byte-mode encoding of UTF-8 bytes.',
        text: 'Cafe ☕ → 中文 / こんにちは — 100% supported',
        size: 250
    },
    {
        key: 'small',
        label: 'Small image size (100 px)',
        category: 'size',
        description: 'Same payload, rendered at 100×100 pixels — useful for compact UI placements.',
        text: 'https://enonic.com',
        size: 100
    },
    {
        key: 'medium',
        label: 'Medium image size (300 px)',
        category: 'size',
        description: 'Same payload, rendered at 300×300 pixels — typical page-level QR code.',
        text: 'https://enonic.com',
        size: 300
    },
    {
        key: 'large',
        label: 'Large image size (600 px)',
        category: 'size',
        description: 'Same payload, rendered at 600×600 pixels — print-quality output.',
        text: 'https://enonic.com',
        size: 600
    }
];

function findCase(key: unknown): PresetCase | undefined {
    if (typeof key !== 'string') {
        return undefined;
    }
    for (let i = 0; i < PRESET_CASES.length; i++) {
        if (PRESET_CASES[i].key === key) {
            return PRESET_CASES[i];
        }
    }
    return undefined;
}

function generate(text: string, size: number): ByteSource {
    return qrcode.generateQrCode({text, size});
}

function toDataUri(image: ByteSource): string {
    return 'data:image/png;base64,' + base64Encode(image);
}

interface RenderedCase {
    key: string;
    label: string;
    category: string;
    description: string;
    text: string;
    displayText: string;
    textLength: number;
    pxSize: number;
    pxSizeText: string;
    dataUri: string;
    rawPngUrl: string;
    dataUriUrl: string;
    error: string | null;
}

function renderCase(c: PresetCase): RenderedCase {
    let dataUri = '';
    let error: string | null = null;
    try {
        const image = generate(c.text, c.size);
        dataUri = toDataUri(image);
    } catch (e: any) {
        error = String(e?.message ?? e);
    }
    return {
        key: c.key,
        label: c.label,
        category: c.category,
        description: c.description,
        text: c.text,
        displayText: c.text === '' ? '(empty)' : c.text,
        textLength: c.text.length,
        pxSize: c.size,
        pxSizeText: String(c.size),
        dataUri,
        rawPngUrl: portal.componentUrl({params: {case: c.key, format: 'png'}}),
        dataUriUrl: portal.componentUrl({params: {case: c.key, format: 'datauri'}}),
        error
    };
}

export const GET = function (req: Request): {contentType: string; body: string | ByteSource; status?: number} {
    const params = req.params;
    const caseKey = params.case;
    const format = params.format;

    if (typeof caseKey === 'string' && (format === 'png' || format === 'datauri')) {
        const preset = findCase(caseKey);
        if (!preset) {
            return {
                status: 404,
                contentType: 'text/plain',
                body: 'Unknown case: ' + caseKey
            };
        }
        try {
            const image = generate(preset.text, preset.size);
            if (format === 'png') {
                return {contentType: 'image/png', body: image};
            }
            return {contentType: 'text/plain', body: toDataUri(image)};
        } catch (e: any) {
            return {
                status: 422,
                contentType: 'text/plain',
                body: 'lib-qrcode rejected case "' + preset.key + '" (' + (preset.text === '' ? '<empty>' : preset.text) + '): ' + String(e?.message ?? e)
            };
        }
    }

    const renderedCases = PRESET_CASES.map(renderCase);
    const payloadCases = renderedCases.filter(c => c.category === 'payload');
    const sizeCases = renderedCases.filter(c => c.category === 'size');
    const view = resolve('qrcode.html');
    const body = thymeleaf.render(view, {
        payloadCases,
        sizeCases,
        caseCount: String(renderedCases.length)
    });

    return {
        contentType: 'text/html',
        body
    };
};
