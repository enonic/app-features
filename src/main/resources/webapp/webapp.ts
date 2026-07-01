import createRouter = require('/lib/router');
import {requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import type {Request, Response} from '@enonic-types/core';

const WEBAPP_BASE = '/webapp/' + app.name;
const NO_STORE_PREFIX = '/no-store-demo/';

// ---------------------------------------------------------------------------
// lib-router — mounted ONLY on /api/<path>. The HTML landing page and static
// assets are handled directly by the controller below, not by the router.
// ---------------------------------------------------------------------------
const router = createRouter();

router.filter(function (req, next) {
    const started = Date.now();
    const response = next(req);
    response.headers = response.headers || {};
    response.headers['X-Router-Filter'] = 'applied';
    response.headers['X-Router-Elapsed-Ms'] = String(Date.now() - started);
    return response;
});

router.get(['/api', '/api/'], function (req) {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            route: 'api-index',
            method: req.method,
            endpoints: [
                '/api/items/{id}',
                '/api/items/{id}/numeric',
                '/api/search?q=',
                '/api/echo (GET, POST)',
                '/api/ping (any method)'
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

// ---------------------------------------------------------------------------
// HTML landing page — modelled on enonic/starter-myfirstwebapp: a plain HTML
// document returned straight from the controller, linking a stylesheet that
// lib-static serves from /assets.
// ---------------------------------------------------------------------------
function renderIndex(): Response {
    const title = 'Features Web app';
    const body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="${WEBAPP_BASE}/styles.css"/>
  </head>
  <body>
    <h1>Sweet, the &quot;Features&quot; web app is working!</h1>
    <p>This web app pairs <code>lib-router</code> (a JSON API under <code>/api</code>)
       with <code>lib-static</code> (asset serving).</p>

    <h2>API &mdash; lib-router</h2>
    <ul>
      <li><a href="${WEBAPP_BASE}/api">/api</a> &mdash; endpoint index</li>
      <li><a href="${WEBAPP_BASE}/api/items/42">/api/items/{id}</a></li>
      <li><a href="${WEBAPP_BASE}/api/items/42/numeric">/api/items/{id}/numeric</a></li>
      <li><a href="${WEBAPP_BASE}/api/search?q=router">/api/search?q=</a></li>
      <li><a href="${WEBAPP_BASE}/api/echo">/api/echo</a> &mdash; GET and POST</li>
      <li><a href="${WEBAPP_BASE}/api/ping">/api/ping</a> &mdash; any method</li>
    </ul>

    <h2>Static assets &mdash; lib-static</h2>
    <ul>
      <li><a href="${WEBAPP_BASE}/static-demo/hello.html">/static-demo/hello.html</a></li>
      <li><a href="${WEBAPP_BASE}/no-store-demo/dev.css">/no-store-demo/dev.css</a> &mdash; served with a no-store cache-control handler</li>
    </ul>
  </body>
</html>
`;
    return {
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: body
    };
}

function relativePath(req: Request): string {
    const raw = req.rawPath || '';
    if (raw.indexOf(WEBAPP_BASE) === 0) {
        return raw.slice(WEBAPP_BASE.length) || '/';
    }
    return raw;
}

export function all(req: Request): Response {
    const path = relativePath(req);

    // The webapp root renders the HTML landing page.
    if (path === '' || path === '/') {
        return renderIndex();
    }

    // Only /api/<path> is routed through lib-router.
    if (path === '/api' || path === '/api/' || path.indexOf('/api/') === 0) {
        return router.dispatch(req);
    }

    // Everything else is a static resource served by lib-static from /assets;
    // the /no-store-demo/ subtree uses the dev (no-store) cache-control handler.
    const noStore = path.indexOf(NO_STORE_PREFIX) === 0;
    return requestHandler(req, {
        root: '/assets',
        cacheControl: noStore ? () => RESPONSE_CACHE_CONTROL.DEV : undefined,
    });
}
