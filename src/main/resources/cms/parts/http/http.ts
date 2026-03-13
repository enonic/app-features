import * as portal from '/lib/xp/portal';
const httpClient = require('/lib/http-client') as any;
const thymeleaf = require('/lib/thymeleaf') as any;

export const GET = function(req: any) {
    const postUrl = portal.componentUrl({});

    const params = {
        postUrl: postUrl,
        method: 'get',
        url: req.scheme + '://' + req.host + ':' + req.port + portal.serviceUrl({
            service: 'httptest'
        } as any),
        headerName1: "Cookie",
        headerValue1: req.headers['Cookie']
    };

    const view = resolve('http.html');
    const body = thymeleaf.render(view, params);

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

export const POST = function(req: any) {
    const p = req.params;
    const url = p.url;
    const method = p.method;
    const contentType = p.contentType;
    const param1 = p.param1;
    const param2 = p.param2;
    const param3 = p.param3;
    const param4 = p.param4;
    const value1 = p.value1;
    const value2 = p.value2;
    const value3 = p.value3;
    const value4 = p.value4;
    const body = p.body;
    const connectTimeout = p.connectTimeout || 10000;
    const readTimeout = p.readTimeout || 10000;
    const headerName1 = p.headerName1;
    const headerName2 = p.headerName2;
    const headerName3 = p.headerName3;
    const headerName4 = p.headerName4;
    const headerValue1 = p.headerValue1;
    const headerValue2 = p.headerValue2;
    const headerValue3 = p.headerValue3;
    const headerValue4 = p.headerValue4;

    const proxyHost = p.proxyHost;
    const proxyPort = p.proxyPort;
    const proxyUsername = p.proxyUsername;
    const proxyPassword = p.proxyPassword;
    const authUsername = p.authUsername;
    const authPassword = p.authPassword;

    let errorMsg: any, infoMsg: any;

    let response: any;
    try {
        const reqParams: any = {
            url: url,
            method: method,
            contentType: contentType,
            body: body,
            connectTimeout: connectTimeout,
            readTimeout: readTimeout,
            headers: getHeaders(req),
            params: getParams(req),
            proxy: {
                host: proxyHost,
                port: proxyPort,
                user: proxyUsername,
                password: proxyPassword
            }
        };
        if (authUsername) {
            reqParams.auth = {
                user: authUsername,
                password: authPassword
            };
        }
        response = httpClient.request(reqParams);

        if (response.contentType === 'application/json') {
            let b = response.body;
            try {
                b = JSON.stringify(JSON.parse(response.body), null, 4);
                response.body = b;
            } catch (e) {
            }
        }

        log.info('RESPONSE %s', response);

        infoMsg = 'Response ' + response.status + ' : ' + response.message;
    } catch (e: any) {
        errorMsg = 'Request error: ' + e.message;
    }

    const postUrl = portal.componentUrl({});

    const params = {
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

        'proxyHost': proxyHost,
        'proxyPort': proxyPort,
        'proxyUsername': proxyUsername,
        'proxyPassword': proxyPassword,

        'authUsername': authUsername,
        'authPassword': authPassword,

        'response': response,
        infoMsg: infoMsg,
        errorMsg: errorMsg
    };

    const view = resolve('http.html');
    const respBody = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: respBody
    };
};

function getHeaders(req: any) {
    const p = req.params;
    let headers: any = null;
    let i = 1;
    let name: any, value: any;
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

function getParams(req: any) {
    const p = req.params;
    let params: any = null;
    let i = 1;
    let name: any, value: any;
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
