import * as contentLib from '/lib/xp/content';
import * as ioLib from '/lib/xp/io';
import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('attachments.html');

const CONTENT_PATH = '/samples/my-attachment-content';

interface Row {
    name: string;
    label: string;
    mimeType: string;
    reportedSize: string;
    streamedSize: string;
    text: string;
    url: string;
    ok: boolean;
    verdict: string;
}

export const GET = function (req: Request) {
    // This content holds three attachments, which is what makes it worth a page of its own: the
    // media samples all carry a single source attachment, so a map of several is untested there.
    // It is created with requireValid: false and left IN_PROGRESS by addAttachment, so it is never
    // published, and an anonymous visitor on master cannot read it.
    let content: ReturnType<typeof contentLib.get> = null;
    let error: string | null = null;

    try {
        content = contentLib.get({key: CONTENT_PATH});
        if (!content) {
            error = 'No content at ' + CONTENT_PATH + ' readable in this branch.';
        }
    } catch (e) {
        error = (e as Error).message || String(e);
    }

    const attachments = content ? contentLib.getAttachments(content._id) : null;
    const names = attachments ? Object.keys(attachments) : [];

    const rows: Row[] = names.map((key) => {
        const attachment = attachments![key];
        const stream = content
            ? contentLib.getAttachmentStream({key: content._id, name: attachment.name})
            : null;
        const streamed = stream ? ioLib.getSize(stream) : -1;
        // Reading the bytes back as text only makes sense because these three are text/plain.
        const text = stream && attachment.mimeType.indexOf('text/') === 0
            ? ioLib.readText(contentLib.getAttachmentStream({key: content!._id, name: attachment.name})!)
            : '';
        const ok = streamed === attachment.size;

        return {
            name: attachment.name,
            label: attachment.label ?? '',
            mimeType: attachment.mimeType,
            reportedSize: attachment.size + ' B',
            streamedSize: streamed < 0 ? 'no stream' : streamed + ' B',
            text,
            url: portal.attachmentUrl({id: content!._id, name: attachment.name}),
            ok,
            verdict: ok ? 'ok' : 'FAILED'
        };
    });

    const failed = rows.filter((row) => !row.ok).length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            rows,
            hasRows: rows.length !== 0,
            error,
            hasError: !!error,
            contentPath: CONTENT_PATH,
            displayName: content ? content.displayName : '',
            workflow: content?.workflow?.state ?? 'unknown',
            valid: content ? String(content.valid) : 'unknown',
            branch: req.branch ?? '',
            summary: rows.length === 0
                ? 'No attachments read'
                : (failed === 0
                    ? `${rows.length} attachments, each stream matching the size the library reports`
                    : `${failed} of ${rows.length} attachments did not match`)
        })
    };
};
