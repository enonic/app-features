import createRouter = require('/lib/router');
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

router.get(['', '/'], function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'index',
            method: req.method,
            message: 'lib-router demo index'
        }
    };
});

router.get('/items/{id}', function (req) {
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

router.get('/items/{id:[0-9]+}/numeric', function (req) {
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

router.get('/search', function (req) {
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

router.get('/echo', function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'echo',
            method: req.method
        }
    };
});

router.post('/echo', function (req) {
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

router.all('/ping', function (req) {
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

router.get(['/static', '/static/{path:.*}'], function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'static',
            path: req.pathParams.path || ''
        }
    };
});

router.all('/{path:.*}', function (req) {
    return {
        status: 404,
        contentType: 'application/json',
        body: {
            route: 'not-found',
            path: req.pathParams.path,
            method: req.method
        }
    };
});

export function all(req: Request): Response {
    return router.dispatch(req);
}
