import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('schedule-publish.html');

function handleGet(req: any) {
    const defaultContent = createContent("Default content");
    const expiredContent = createContent("Expired content");
    const pendingContent = createContent("Pending content");
    const content = createContent("Content");

    publishContent(defaultContent);
    publishContent(expiredContent, {
        from: new Date().toISOString(),
        to: new Date().toISOString()
    });
    publishContent(pendingContent, {
        from: '2018-01-01T13:37:00.000Z',
        to: '2019-01-01T13:37:00.000Z'
    });
    publishContent(content, {
        from: new Date().toISOString(),
        to: '2018-01-01T13:37:00.000Z'
    });

    const getDefaultContentDraft = getContent(defaultContent, 'draft');
    const getExpiredContentDraft = getContent(expiredContent, 'draft');
    const getPendingContentDraft = getContent(pendingContent, 'draft');
    const getContentDraft = getContent(content, 'draft');
    const getChildrenDraft = getChildren('draft');
    const getDefaultContentMaster = getContent(defaultContent, 'master');
    const getExpiredContentMaster = getContent(expiredContent, 'master');
    const getPendingContentMaster = getContent(pendingContent, 'master');
    const getContentMaster = getContent(content, 'master');
    const getChildrenMaster = getChildren('master');

    deleteContent(defaultContent);
    deleteContent(expiredContent);
    deleteContent(pendingContent);
    deleteContent(content);

    publishContent(defaultContent);
    publishContent(expiredContent);
    publishContent(pendingContent);
    publishContent(content);

    const params = {
        getDefaultContentDraft: JSON.stringify(getDefaultContentDraft, null, 2),
        getExpiredContentDraft: JSON.stringify(getExpiredContentDraft, null, 2),
        getPendingContentDraft: JSON.stringify(getPendingContentDraft, null, 2),
        getContentDraft: JSON.stringify(getContentDraft, null, 2),
        getChildrenDraft: JSON.stringify(getChildrenDraft, null, 2),
        getDefaultContentMaster: JSON.stringify(getDefaultContentMaster, null, 2),
        getExpiredContentMaster: JSON.stringify(getExpiredContentMaster, null, 2),
        getPendingContentMaster: JSON.stringify(getPendingContentMaster, null, 2),
        getContentMaster: JSON.stringify(getContentMaster, null, 2),
        getChildrenMaster: JSON.stringify(getChildrenMaster, null, 2)
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

function createContent(name: any) {
    return contentLib.create({
        parentPath: '/features/js-libraries/schedule-publish',
        displayName: name,
        requireValid: true,
        contentType: 'base:folder',
        branch: 'draft',
        language: 'no',
        data: {}
    } as any);
}

function getContent(content: any, branch: any) {
    return contentLib.get({
        key: content._id,
        branch: branch
    } as any);
}

function getChildren(branch: any) {
    return contentLib.getChildren({
        key: '/features/js-libraries/schedule-publish',
        branch: branch
    } as any);
}

function publishContent(content: any, schedule?: any) {
    return contentLib.publish({
        keys: [content._id],
        sourceBranch: 'draft',
        targetBranch: 'master',
        schedule: schedule
    } as any);
}

function deleteContent(content: any) {
    return contentLib.delete({
        key: content._path
    });
}

export { handleGet as GET };
