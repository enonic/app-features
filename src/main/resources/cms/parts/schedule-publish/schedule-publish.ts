import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import type {Content, Request} from '@enonic-types/core';
import type {Schedule} from '@enonic-types/lib-content';

const view = resolve('schedule-publish.html');

function handleGet(req: Request) {
    const defaultContent = createContent("Default content");
    const expiredContent = createContent("Expired content");
    const pendingContent = createContent("Pending content");
    const content = createContent("Content");

    let now = Date.now();

    publishContent(defaultContent);
    publishContent(expiredContent, {
        from: new Date(now).toISOString(),
        to: new Date(now + 1).toISOString()
    });
    publishContent(pendingContent, {
        from: '2018-01-01T13:37:00.000Z',
        to: '2019-01-01T13:37:00.000Z'
    });
    publishContent(content, {
        from: new Date(now).toISOString(),
        to: new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString()
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

function createContent(name: string) {
    return contentLib.create({
        parentPath: '/features/js-libraries/schedule-publish',
        displayName: name,
        requireValid: true,
        contentType: 'base:folder',
        language: 'no',
        data: {}
    });
}

function getContent(content: Content, branch: string) {
    return contextLib.run({
        branch: branch
    }, () => contentLib.get({
        key: content._id
    }));
}

function getChildren(branch: string) {
    return contextLib.run({
        branch: branch
    }, () => contentLib.getChildren({
        key: '/features/js-libraries/schedule-publish'
    }));
}

function publishContent(content: Content, schedule?: Schedule) {

    return contentLib.publish({
        keys: [content._id],
        schedule: schedule
    });
}

export {handleGet as GET};
