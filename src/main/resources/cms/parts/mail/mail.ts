import * as portal from '/lib/xp/portal';
import * as mail from '/lib/xp/mail';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';
import type {Attachment} from '@enonic-types/lib-mail';

export const GET = function (req: Request) {
    const postUrl = portal.componentUrl({});
    const result = req.params.result;

    const params = {
        postUrl: postUrl,
        pageRedirect: portal.getContent()._path,
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

export const POST = function (req: Request) {
    const subject = requireSingleString(req.params, 'subject');
    const from = requireSingleString(req.params, 'from');
    const to = req.params.to;
    const cc = req.params.cc;
    const bcc = req.params.bcc;
    const replyTo = requireSingleString(req.params, 'replyTo');
    const body = requireSingleString(req.params, 'body');
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
    });

    const redirectUrl = portal.pageUrl({
        path: pageRedirect as string,
        params: {
            result: sendResult
        }
    });

    return {
        redirect: redirectUrl
    };
};

function getAttachments() {
    const file1 = portal.getMultipartItem('file1');
    const file2 = portal.getMultipartItem('file2');
    const attachments: Attachment[] = [];
    if (file1 && file1.size > 0) {
        attachments.push({
            fileName: file1.fileName,
            mimeType: file1.contentType,
            data: portal.getMultipartStream('file1')
        });
    }
    if (file2 && file2.size > 0) {
        attachments.push({
            fileName: file2.fileName,
            mimeType: file2.contentType,
            data: portal.getMultipartStream('file2')
        });
    }
    return attachments;
}

function requireSingleString<
    T extends Record<string, string | string[] | undefined>,
    K extends keyof T
>(obj: T, key: K): string {
    const value = obj[key];

    if (typeof value === "string") {
        return value;
    }

    throw new Error(`${String(key)} must be a single string`);
}