var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var mail = require('/lib/xp/mail');


exports.get = function (req) {
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl
    };

    var view = resolve('mail.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/mail/mail.css'}) + '" type="text/css" />',
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/mail/mail.js'}) + '" type="text/javascript"></script>',
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

    var sendResult = mail.send({
        subject: subject,
        from: from,
        to: to,
        cc: cc,
        bcc: bcc,
        replyTo: replyTo,
        body: body
    });
    log.info('SEND %s', sendResult);

    return {
        contentType: 'application/json',
        body: {
            result: sendResult
        }
    };
};