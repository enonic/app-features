var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var mail = require('/lib/xp/mail');


exports.get = function (req) {
    var postUrl = portal.componentUrl({});
    var result = req.params.result;

    var params = {
        postUrl: postUrl,
        pageRedirect: portal.getContent()._path,
        result: result
    };

    var view = resolve('mail.html');
    var body = thymeleaf.render(view, params);

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

exports.post = function (req) {
    var subject = req.params.subject;
    var from = req.params.from;
    var to = req.params.to;
    var cc = req.params.cc;
    var bcc = req.params.bcc;
    var replyTo = req.params.replyTo;
    var body = req.params.body;
    var pageRedirect = req.params.pageRedirect;

    var sendResult = mail.send({
        subject: subject,
        from: from,
        to: to,
        cc: cc,
        bcc: bcc,
        replyTo: replyTo,
        body: body,
        attachments: getAttachments()
    });

    var redirectUrl = portal.pageUrl({
        path: pageRedirect,
        params: {
            result: sendResult
        }
    });

    return {
        redirect: redirectUrl
    };
};

function getAttachments() {
    var file1 = portal.getMultipartItem('file1');
    var file2 = portal.getMultipartItem('file2');
    var attachments = [];
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
