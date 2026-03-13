import * as portal from '/lib/xp/portal';

function handleReq(req: any) {
    log.info('REQUEST: %s', req);

    return {
        contentType: 'application/json',
        body: req
    };
}

export { handleReq as GET };
export { handleReq as POST };
export { handleReq as PUT };
export { handleReq as PATCH };
export { handleReq as DELETE };
export { handleReq as HEAD };
export { handleReq as OPTIONS };
