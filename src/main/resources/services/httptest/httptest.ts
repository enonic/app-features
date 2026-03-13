import * as portal from '/lib/xp/portal';

function handleReq(req: any) {
    log.info('REQUEST: %s', req);

    return {
        contentType: 'application/json',
        body: req
    };
}

export { handleReq as get };
export { handleReq as post };
export { handleReq as put };
export { handleReq as patch };
export { handleReq as delete };
export { handleReq as head };
export { handleReq as options };
