import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as contentSvc from '/lib/xp/content';
import type { Request } from '@enonic-types/core';

export const GET = function(req: Request) {
    const component = portal.getComponent() as any;
    const targetFolder = component.config.targetFolder;
    let parentPath = '';
    if (targetFolder) {
        const folder = contentSvc.get({
            key: targetFolder
        }) as any;
        parentPath = folder ? folder._path : '';
    }

    const postUrl = portal.componentUrl({});

    const params = {
        postUrl: postUrl,
        parentPath: parentPath,
        displayName: '',
        contentName: '',
        contentType: 'base:unstructured',
        contentData: '{}',
        contentXData: '{}'
    };

    const view = resolve('createContent.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/createContent/createContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

export const POST = function(req: Request) {
    const name = req.params.name as string;
    const displayName = req.params.displayName as string;
    const parentPath = req.params.parent as string;
    const contentType = req.params.contentType as string || 'base:unstructured';
    const dataStr = req.params.contentData as string || '{}';
    const xDataStr = req.params.contentXData as string || '{}';

    let errorMsg: any;
    let msg: any;
    let nameResult = name;
    let dataStrResult = dataStr;
    let xDataStrResult = xDataStr;
    try {
        const data = JSON.parse(dataStr);
        const xdata = JSON.parse(xDataStr);

        const createResult = contentSvc.create({
            name: name,
            parentPath: parentPath,
            displayName: displayName,
            contentType: contentType,
            data: data,
            x: xdata
        } as any) as any;

        msg = 'Content created: ' + createResult._path;
        nameResult = createResult._name;
        dataStrResult = JSON.stringify(createResult.data, null, 4);
        xDataStrResult = JSON.stringify(createResult.x, null, 4);
    } catch (e: any) {
        if (e.code === 'contentAlreadyExist') {
            errorMsg = 'There is already a content with that name';
        } else {
            errorMsg = 'Error: ' + e.message;
        }
    }

    const postUrl = portal.componentUrl({});
    const params = {
        postUrl: postUrl,
        parentPath: parentPath,
        displayName: displayName,
        contentName: nameResult,
        contentType: contentType,
        contentData: dataStrResult,
        contentXData: xDataStrResult,
        errorMsg: errorMsg,
        msg: msg
    };

    const view = resolve('createContent.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/createContent/createContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};
