var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var view = resolve('schedule-publish.html');
var thymeleaf = require('/lib/thymeleaf');

function handleGet(req) {

    var defaultContent = createContent("Default content");
    var expiredContent = createContent("Expired content");
    var pendingContent = createContent("Pending content");
    var content = createContent("Content");

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

    var getDefaultContentDraft = getContent(defaultContent, 'draft');
    var getExpiredContentDraft = getContent(expiredContent, 'draft');
    var getPendingContentDraft = getContent(pendingContent, 'draft');
    var getContentDraft = getContent(content, 'draft');
    var getChildrenDraft = getChildren('draft');
    var getDefaultContentMaster = getContent(defaultContent, 'master');
    var getExpiredContentMaster = getContent(expiredContent, 'master');
    var getPendingContentMaster = getContent(pendingContent, 'master');
    var getContentMaster = getContent(content, 'master');
    var getChildrenMaster = getChildren('master');

    deleteContent(defaultContent);
    deleteContent(expiredContent);
    deleteContent(pendingContent);
    deleteContent(content);

    publishContent(defaultContent);
    publishContent(expiredContent);
    publishContent(pendingContent);
    publishContent(content);

    var params = {
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

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

function createContent(name) {
    return contentLib.create({
        parentPath: '/features/js-libraries/schedule-publish',
        displayName: name,
        requireValid: true,
        contentType: 'base:folder',
        branch: 'draft',
        language: 'no',
        data: {}
    });
}

function getContent(content, branch) {
    return contentLib.get({
        key: content._id,
        branch: branch
    });
}

function getChildren(branch) {
    return contentLib.getChildren({
        key: '/features/js-libraries/schedule-publish',
        branch: branch
    });
}

function publishContent(content, schedule) {
    return contentLib.publish({
        keys: [content._id],
        sourceBranch: 'draft',
        targetBranch: 'master',
        schedule: schedule

    });
}

function deleteContent(content) {
    return contentLib.delete({
        key: content._path
    });
}

exports.get = handleGet;