import * as contentLib from '/lib/xp/content';
import * as portal from '/lib/xp/portal';
import * as httpClient from '/lib/http-client';
import * as ioLib from '/lib/xp/io';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';

const view = resolve('media.html');

const PARENT = '/samples/media';

// Registered types, so a plausible-looking but unregistered spelling is flagged rather than
// trusted. `audio/mp3` is the one that bit us: Chrome tolerates it, Firefox refuses to play it.
const REGISTERED = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/tiff',
    'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/mp4',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf', 'application/zip', 'text/plain'
];

interface Item {
    id: string;
    name: string;
    displayName: string;
    type: string;
    mimeType: string;
    fileSize: string;
    kind: string;
    url: string;
    absoluteUrl: string;
    imageUrl: string;
    registered: boolean;
    registeredVerdict: string;
    registeredClass: string;
}

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function kindOf(mimeType: string): string {
    if (mimeType.indexOf('image/') === 0) {
        return 'image';
    }
    if (mimeType.indexOf('audio/') === 0) {
        return 'audio';
    }
    if (mimeType.indexOf('video/') === 0) {
        return 'video';
    }
    if (mimeType === 'application/pdf') {
        return 'pdf';
    }
    return 'other';
}

function readable(size: number): string {
    if (!size) {
        return 'unknown';
    }
    if (size < 1024) {
        return size + ' B';
    }
    if (size < 1024 * 1024) {
        return Math.round(size / 1024) + ' kB';
    }
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

function items(): Item[] {
    const result = contentLib.query({parent: PARENT, recursive: true, count: -1});

    return result.hits
        .filter((content) => content.type.indexOf('media:') === 0)
        .map((content) => {
            const data = content.data as {mimeType?: string};
            const attachment = content.attachments[content._name] ?? Object.keys(content.attachments)
                .map((key) => content.attachments[key])[0];
            const mimeType = data.mimeType ?? attachment?.mimeType ?? 'unknown';
            const registered = REGISTERED.indexOf(mimeType) !== -1;

            return {
                id: content._id,
                name: content._name,
                displayName: content.displayName,
                type: content.type,
                mimeType,
                // Named fileSize, not size: `item.size` in the view resolves to Map.size(),
                // the number of keys on the object, rather than this value.
                fileSize: readable(attachment?.size ?? 0),
                kind: kindOf(mimeType),
                url: portal.attachmentUrl({id: content._id}),
                absoluteUrl: portal.attachmentUrl({id: content._id, type: 'absolute'}),
                imageUrl: content.type === 'media:image'
                    ? portal.imageUrl({id: content._id, scale: 'width(320)'})
                    : '',
                registered,
                registeredVerdict: registered ? 'registered' : 'NOT REGISTERED',
                registeredClass: registered ? 'ok' : 'blocked'
            };
        });
}

// getAttachments and getAttachmentStream had no coverage anywhere else once the unreachable
// attachments page went, so the verification run exercises them here: the metadata the library
// reports, and the byte count of the stream against the size the content declares.
function attachmentCheck(id: string, name: string, declaredSize: string): {ok: boolean; detail: string} {
    const attachments = contentLib.getAttachments(id);

    if (!attachments) {
        return {ok: false, detail: 'getAttachments returned nothing'};
    }

    const names = Object.keys(attachments);
    const attachment = attachments[name] ?? attachments[names[0]];

    if (!attachment) {
        return {ok: false, detail: 'no attachment among ' + names.join(', ')};
    }

    const stream = contentLib.getAttachmentStream({key: id, name: attachment.name});

    if (!stream) {
        return {ok: false, detail: 'getAttachmentStream returned nothing for ' + attachment.name};
    }

    const streamed = ioLib.getSize(stream);

    return {
        ok: streamed === attachment.size,
        detail: `getAttachments reported ${attachment.size} B for ${attachment.name}, the stream carried ${streamed} B`
            + (declaredSize ? '' : '')
    };
}

export const GET = function (req: Request) {
    // Fetching every item to check it would hold the response, and Content Studio would sit on a
    // spinner, so verification is asked for separately.
    if (firstValue(req.params.verify) === 'json') {
        const results = items().map((item) => {
            try {
                const response = httpClient.request({url: item.absoluteUrl, method: 'HEAD'});
                const served = (response.contentType ?? '').split(';')[0];
                const attachment = attachmentCheck(item.id, item.name, item.fileSize);
                const ok = response.status === 200 && served === item.mimeType && item.registered
                    && attachment.ok;

                return {
                    name: item.name,
                    ok,
                    verdict: ok ? 'ok' : 'FAILED',
                    detail: `status ${response.status}, declared ${item.mimeType}, served ${served || 'nothing'}`
                        + (item.registered ? '' : ', and the declared type is not registered')
                        + '. ' + attachment.detail
                };
            } catch (e) {
                return {
                    name: item.name,
                    ok: false,
                    verdict: 'ERROR',
                    detail: (e as Error).message || String(e)
                };
            }
        });

        const failed = results.filter((one) => !one.ok).length;

        return {
            contentType: 'application/json',
            body: JSON.stringify({
                results,
                summary: failed === 0
                    ? `All ${results.length} items served the type they declare`
                    : `${failed} of ${results.length} items did not`
            })
        };
    }

    const all = items();
    const unregistered = all.filter((item) => !item.registered).length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            items: all,
            hasItems: all.length !== 0,
            parent: PARENT,
            summary: unregistered === 0
                ? `${all.length} media items, all declaring a registered mime type`
                : `${all.length} media items, ${unregistered} declaring a type that is not registered`,
            selfUrl: req.path,
            scriptUrl: assetUrl({path: 'js/pages/samples/media.js'})
        })
    };
};
