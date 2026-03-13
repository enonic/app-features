import * as portal from '/lib/xp/portal';

function handleGet(req: any) {
    const site = portal.getSite();

    return {
        contentType: 'application/json',
        body: site
    };
}

export { handleGet as GET };
