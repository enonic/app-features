import * as libPortal from '/lib/xp/portal';
import * as libThymeleaf from '/lib/thymeleaf';
import * as auditLib from '/lib/xp/auditlog';
import type {Request, RequestParams, UserKey} from '@enonic-types/core';
import type {AuditLogParams, FindAuditLogParams} from '@enonic-types/lib-auditlog';

const partView = resolve('auditLog.html');
const createView = resolve('./includes/createForm.html');
const tableView = resolve('./includes/auditLogTable.html');

function doLog(params: AuditLogParams<Record<string, unknown>>) {
    let msg: string | undefined, errorMsg: string | undefined;
    try {
        const response = auditLib.log(params);
        msg = 'Audit Log was created : ' + response._id;
    } catch (e: any) {
        errorMsg = 'Error: ' + e.message;
    }

    return {
        contentType: 'text/html',
        body: libThymeleaf.render(createView, {
            msg: msg,
            errorMsg: errorMsg
        })
    };
}

function doFind(params: RequestParams) {
    const startStr = params.start as string;
    const countStr = params.count as string;
    const request: FindAuditLogParams = {
        start: startStr && /^\d+$/.test(startStr) ? parseInt(startStr) : 0,
        count: countStr && /^\d+$/.test(countStr) ? parseInt(countStr) : 10
    };

    if (params.from) {
        request.from = params.from as string;
    }
    if (params.to) {
        request.to = params.to as string;
    }
    if (params.type) {
        request.type = params.type as string;
    }
    if (params.source) {
        request.source = params.source as string;
    }
    if (params.ids) {
        request.ids = (params.ids as string).split(",", -1);
    }
    if (params.users) {
        request.users = (params.users as string).split(",", -1);
    }
    if (params.objects) {
        request.objects = (params.objects as string).split(",", -1);
    }

    return {
        contentType: 'text/html',
        body: libThymeleaf.render(tableView, {
            auditLogs: auditLib.find(request).hits
        })
    };
}

function doGet(params: RequestParams) {
    const response = auditLib.get({
        id: params.id as string
    });

    return {
        contentType: 'application/json',
        body: JSON.stringify(response)
    };
}

function doExecute(params: RequestParams) {
    switch (params.operation as string) {
    case 'log':
        return doLog({
            type: params.type as string,
            time: params.time as string || null,
            source: params.source as string || null,
            user: (params.user as string || null) as UserKey | null,
            objects: params.objects ? (params.objects as string).split(',', -1) : [],
            data: JSON.parse(params.data as string || '{}')
        });
    case 'find':
        return doFind(params);
    case 'get':
        return doGet(params);
    default:
        throw Error("Unsupported operation");
    }
}

export const GET = function (req: Request) {
    return {
        contentType: 'text/html',
        body: libThymeleaf.render(partView, {
            auditLogs: auditLib.find({}).hits,
            postUrl: libPortal.componentUrl({})
        }),
        pageContributions: {
            bodyEnd: [
                '<script src="' + libPortal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + libPortal.assetUrl({path: 'js/parts/auditLog/auditLog.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

export const POST = function (req: Request) {
    return doExecute(req.params);
};
