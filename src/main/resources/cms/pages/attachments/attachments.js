var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

exports.get = function (req) {
    var attachmentName = req.params.name;
    var contentPath = req.params.contentPath;
    var attachments, attachment, attachmentStream;

    var pageUrl = portal.pageUrl({});

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
            }
        } else {
            log.info('Could not find attachment %s for content %s', attachmentName, contentPath);
        }
    }

    var params = {
        pageUrl: pageUrl,
        contentPath: contentPath || '/features/media/image/Renault4_R01.jpg',
        attachments: attachments
    };

    var view = resolve('attachments.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

exports.post = exports.get;