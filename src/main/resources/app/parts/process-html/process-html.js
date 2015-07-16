var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentSvc = require('/lib/xp/content');

exports.get = function(req) {

    var htmlPages;
    var query = "";
    var content = portal.getContent();
    var currentPage = portal.pageUrl({
        path: content._path
    });

    var view = resolve('process-html.html');
    if (req.params.htmlPage) {
        var htmlPage = getHtmlPage(req.params.htmlPage);
        if(htmlPage) {
            query = "_name != '" + htmlPage.displayName + "'";
        }
    }


    htmlPages = contentSvc.query({
            start: 0,
            count: 25,
            contentTypes: [
                module.name + ':tinymce'
            ],
            query: query
        }
    );


    var params = {
        htmlPages: htmlPages.contents,
        content: content,
        currentPage: currentPage,
        currentHtmlPage: htmlPage
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };

    function getHtmlPage(htmlPageName) {
        var result = contentSvc.query({
                count: 1,
                contentTypes: [
                    module.name + ':tinymce'
                ],
                "query": "_name = '" + htmlPageName + "'"
            }
        );

        return result.contents[0];
    }

};
