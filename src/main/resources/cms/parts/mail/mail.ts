import * as portal from '/lib/xp/portal';
import * as mail from '/lib/xp/mail';
const thymeleaf = require('/lib/thymeleaf') as any;
import type { Request } from '@enonic-types/core';

export const GET = function(req: Request) {
    const postUrl = portal.componentUrl({});
    const result = req.params.result;

    const params = {
        postUrl: postUrl,
        pageRedirect: (portal.getContent() as any)._path,
        result: result
    };

    const view = resolve('mail.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/mail/mail.css'}) + '" type="text/css" />'
            ]
        }
    };
};

export const POST = function(req: Request) {
    const subject = req.params.subject;
    const from = req.params.from;
    const to = req.params.to;
    const cc = req.params.cc;
    const bcc = req.params.bcc;
    const replyTo = req.params.replyTo;
    const body = req.params.body;
    const pageRedirect = req.params.pageRedirect;

    const sendResult = mail.send({
        subject: subject,
        from: from,
        to: to,
        cc: cc,
        bcc: bcc,
        replyTo: replyTo,
        body: body,
        attachments: getAttachments()
    } as any);

    const redirectUrl = portal.pageUrl({
        path: pageRedirect,
        params: {
            result: sendResult
        }
    } as any);

    return {
        redirect: redirectUrl
    };
};

function getAttachments() {
    const file1 = portal.getMultipartItem('file1') as any;
    const file2 = portal.getMultipartItem('file2') as any;
    const attachments: any[] = [];
    if (file1 && file1.size > 0) {
        attachments.push({
            fileName: file1.fileName,
            mimeType: file1.mimeType,
            data: portal.getMultipartStream('file1')
        });
    }
    if (file2 && file2.size > 0) {
        attachments.push({
            fileName: file2.fileName,
            mimeType: file2.mimeType,
            data: portal.getMultipartStream('file2')
        });
    }
    return attachments;
}
