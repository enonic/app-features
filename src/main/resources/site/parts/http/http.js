var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var httpClient = require('/lib/xp/http-client');


exports.get = function (req) {
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        method: 'get',
        url: req.scheme + '://' + req.host + ':' + req.port + portal.serviceUrl({
            service: 'httptest'
        }),
        headerName1: "Cookie",
        headerValue1: req.headers['Cookie']
    };

    var view = resolve('http.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/http/http.css'}) + '" type="text/css" />'
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/http/http.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

exports.post = function (req) {
    var p = req.params;
    var url = p.url;
    var method = p.method;
    var contentType = p.contentType;
    var param1 = p.param1;
    var param2 = p.param2;
    var param3 = p.param3;
    var param4 = p.param4;
    var value1 = p.value1;
    var value2 = p.value2;
    var value3 = p.value3;
    var value4 = p.value4;
    var body = p.body;
    var connectTimeout = p.connectTimeout || 10000;
    var readTimeout = p.readTimeout || 10000;
    var headerName1 = p.headerName1;
    var headerName2 = p.headerName2;
    var headerName3 = p.headerName3;
    var headerName4 = p.headerName4;
    var headerValue1 = p.headerValue1;
    var headerValue2 = p.headerValue2;
    var headerValue3 = p.headerValue3;
    var headerValue4 = p.headerValue4;

    var errorMsg, infoMsg;

    var response;
    try {
        response = httpClient.request({
            url: url,
            method: method,
            contentType: contentType,
            body: body,
            connectTimeout: connectTimeout,
            readTimeout: readTimeout,
            headers: getHeaders(req),
            params: getParams(req)
        });

        if (response.contentType == 'application/json') {
            var b = response.body;
            try {
                b = JSON.stringify(JSON.parse(response.body), null, 4);
                response.body = b;
            } catch (e) {
            }
        }

        log.info('RESPONSE %s', response);

        infoMsg = 'Response ' + response.status + ' : ' + response.message;
    } catch (e) {
        errorMsg = 'Request error: ' + e.message;
    }


    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        'url': url,
        'method': method,
        'contentType': contentType,
        'param1': param1,
        'param2': param2,
        'param3': param3,
        'param4': param4,
        'value1': value1,
        'value2': value2,
        'value3': value3,
        'value4': value4,
        'body': body ? body : null,
        'connectTimeout': connectTimeout,
        'readTimeout': readTimeout,
        'headerName1': headerName1,
        'headerName2': headerName2,
        'headerName3': headerName3,
        'headerName4': headerName4,
        'headerValue1': headerValue1,
        'headerValue2': headerValue2,
        'headerValue3': headerValue3,
        'headerValue4': headerValue4,

        'response': response,
        infoMsg: infoMsg,
        errorMsg: errorMsg
    };

    var view = resolve('http.html');
    var respBody = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: respBody
    };
};

function getHeaders(req) {
    var p = req.params;
    var headers = null, i = 1, name, value;
    while (p['headerName' + i] && p['headerValue' + i]) {
        if (!headers) {
            headers = {};
        }
        name = p['headerName' + i];
        value = p['headerValue' + i];
        headers[name] = value;
        i++;
    }
    return headers;
}

function getParams(req) {
    var p = req.params;
    var params = null, i = 1, name, value;
    while (p['param' + i] && p['value' + i]) {
        if (!params) {
            params = {};
        }
        name = p['param' + i];
        value = p['value' + i];
        params[name] = value;
        i++;
    }
    return params;
}