import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const attachmentName = req.params.name as string;
    const contentPath = req.params.contentPath as string;
    let attachments: any, attachment: any, attachmentStream: any;

    const pageUrl = portal.pageUrl({} as any);

    if (contentPath) {
        attachments = contentLib.getAttachments(contentPath);
        log.info('Attachments %s:', attachments);
    }

    if (attachmentName && attachments && attachments[attachmentName]) {
        attachmentStream = contentLib.getAttachmentStream({
            key: contentPath,
            name: attachmentName
        });
        if (attachmentStream) {
            return {
                body: attachmentStream,
                contentType: attachments[attachmentName].mimeType
            };
        } else {
            log.info('Could not find attachment %s for content %s', attachmentName, contentPath);
        }
    }

    const params = {
        pageUrl: pageUrl,
        contentPath: contentPath || '/features/media/image/Renault4_R01.jpg',
        attachments: attachments
    };

    const view = resolve('attachments.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

export {GET as POST};
