import createRouter = require('/lib/router');
import {requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import type {Request, Response} from '@enonic-types/core';

const router = createRouter();

router.filter(function (req, next) {
    const started = Date.now();
    const response = next(req);
    response.headers = response.headers || {};
    response.headers['X-Router-Filter'] = 'applied';
    response.headers['X-Router-Elapsed-Ms'] = String(Date.now() - started);
    return response;
});

router.get(['', '/', '/api', '/api/'], function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'index',
            method: req.method,
            message: 'lib-router + lib-static demo',
            api: [
                '/api/items/{id}',
                '/api/items/{id}/numeric',
                '/api/search?q=',
                '/api/echo (GET, POST)',
                '/api/ping (any method)'
            ],
            static: [
                '/static-demo/hello.html',
                '/no-store-demo/dev.css (served with a no-store cache-control handler)'
            ]
        }
    };
});

router.get('/api/items/{id}', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'items/{id}',
            id: req.pathParams.id,
            method: req.method
        }
    };
});

router.get('/api/items/{id:[0-9]+}/numeric', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'items/{id:[0-9]+}/numeric',
            id: req.pathParams.id,
            numeric: true
        }
    };
});

router.get('/api/search', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'search',
            query: req.params,
            q: req.params.q || null
        }
    };
});

router.get('/api/echo', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'echo',
            method: req.method
        }
    };
});

router.post('/api/echo', function (req) {
    return {
        status: 201,
        contentType: 'application/json',
        body: {
            route: 'echo',
            method: req.method,
            received: req.body || null
        }
    };
});

router.all('/api/ping', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'ping',
            method: req.method,
            pong: true
        }
    };
});

// lib-static as a router handler: the /no-store-demo/ subtree is served with a
// dedicated no-store cache-control handler, kept separate from the default
// static handler below to demonstrate lib-static's cacheControl option.
router.get('/no-store-demo/{path:.*}', function (req) {
    return requestHandler(req, {
        root: '/assets',
        cacheControl: () => RESPONSE_CACHE_CONTROL.DEV,
    });
});

// Everything else is delegated to lib-static, which resolves the request under
// /assets and returns its own 404 when the file is missing. Running as a router
// route means the X-Router-Filter / elapsed headers wrap static responses too.
router.all('/{path:.*}', function (req) {
    return requestHandler(req, {
        root: '/assets',
    });
});

export function all(req: Request): Response {
    return router.dispatch(req);
}
