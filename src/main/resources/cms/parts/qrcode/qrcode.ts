import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as qrcode from '/lib/qrcode';
import {base64Encode} from '/lib/text-encoding';
import type {PartComponent, Request} from '@enonic-types/core';

const DEFAULT_TEXT = 'https://enonic.com';
const DEFAULT_SIZE = 250;
const MIN_SIZE = 50;
const MAX_SIZE = 1000;

function clampSize(raw: unknown): number {
    const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
    if (isNaN(n) || !isFinite(n)) {
        return DEFAULT_SIZE;
    }
    return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));
}

export const GET = function (req: Request): {contentType: string; body: string} {
    const component = portal.getComponent<PartComponent>();
    const config = component?.config ?? {};

    const text = (req.params.text as string | undefined)
        ?? (config.text as string | undefined)
        ?? DEFAULT_TEXT;
    const size = clampSize(req.params.size ?? config.size);

    const image = qrcode.generateQrCode({text, size});
    const dataUri = 'data:image/png;base64,' + base64Encode(image);

    const view = resolve('qrcode.html');
    const body = thymeleaf.render(view, {
        postUrl: portal.componentUrl({}),
        text,
        size,
        sizeText: String(size),
        dataUri
    });

    return {
        contentType: 'text/html',
        body
    };
};
