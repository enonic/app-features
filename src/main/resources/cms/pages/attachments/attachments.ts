import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

export const GET = function(req: any) {
    const attachmentName = req.params.name;
    const contentPath = req.params.contentPath;
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

export { GET as POST };
