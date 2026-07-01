import type {Request} from '@enonic-types/core';
import * as cronDemo from '/lib/cron-demo';
import {sseClientCount, wsSessionCount} from '/lib/cron-broadcaster';

function toIntOrUndefined(value: string | string[] | undefined): number | undefined {
    if (value === undefined) {
        return undefined;
    }
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined || raw === '') {
        return undefined;
    }
    const num = parseInt(raw, 10);
    return isNaN(num) ? undefined : num;
}

function stringParam(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return Array.isArray(value) ? value[0] : value;
}

function jsonResponse(body: unknown, status = 200) {
    return {
        status,
        contentType: 'application/json',
        body: JSON.stringify(body)
    };
}

function readParams(req: Request) {
    return {
        name: stringParam(req.params.name),
        fixedDelay: toIntOrUndefined(req.params.fixedDelay),
        delay: toIntOrUndefined(req.params.delay),
        cron: stringParam(req.params.cron),
        times: toIntOrUndefined(req.params.times)
    };
}

function handle(operation: string, req: Request) {
    const params = readParams(req);
    if (operation === 'schedule') {
        const result = cronDemo.start(params);
        return jsonResponse({operation, ...result});
    }
    if (operation === 'reschedule') {
        const result = cronDemo.reschedule(params);
        return jsonResponse({operation, ...result});
    }
    if (operation === 'unschedule') {
        const result = cronDemo.stop(params.name);
        return jsonResponse({operation, ...result});
    }
    if (operation === 'list') {
        return jsonResponse({
            operation,
            jobs: cronDemo.list(params.name),
            sseClients: sseClientCount(),
            wsSessions: wsSessionCount()
        });
    }
    if (operation === 'get') {
        return jsonResponse({operation, job: cronDemo.get(params.name)});
    }
    return jsonResponse({error: 'Unknown operation: ' + operation}, 400);
}

export const GET = function (req: Request) {
    const operation = stringParam(req.params.operation);
    if (!operation) {
        return jsonResponse({
            usage: 'GET/POST with ?operation=schedule|reschedule|unschedule|list|get [&name=...&fixedDelay=...&cron=...&delay=...&times=...]',
            defaultJobName: cronDemo.DEFAULT_JOB_NAME,
            sseClients: sseClientCount(),
            wsSessions: wsSessionCount(),
            jobs: cronDemo.list()
        });
    }
    return handle(operation, req);
};

export const POST = function (req: Request) {
    const operation = stringParam(req.params.operation);
    if (!operation) {
        return jsonResponse({error: 'operation is required'}, 400);
    }
    return handle(operation, req);
};
