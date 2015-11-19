var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentLib = require('/lib/xp/content');

exports.get = function (req) {
    var idsParam = req.params.ids;
    var ids = idsParam ? idsParam.split(',') : [];

    var postUrl = portal.componentUrl({});
    var redirectPageId = portal.getContent()._id;
    var files = getCreatedContentFiles(ids);

    var params = {
        postUrl: postUrl,
        multipartRedirect: redirectPageId,
        files: files.length > 0 ? files : null,
        targetFolder: getDefaultFolderPath()
    };


    var view = resolve('multipart.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

exports.post = function (req) {
    var multipartForm;

    multipartForm = portal.getMultipartForm();
    log.info('Multipart %s', multipartForm);
    var contentIds = createMedia(multipartForm);

    var pageId = portal.getMultipartText('multipartRedirect');
    var redirectUrl = portal.pageUrl({
        id: pageId,
        params: {
            ids: contentIds.join(',')
        }
    });

    return {
        redirect: redirectUrl
    };
};

function createMedia(multipartForm) {
    var uploadFolder, media, part, partBytes, contentIds = [];

    var targetFolderPath = portal.getMultipartText('targetFolder');
    if (targetFolderPath) {
        uploadFolder = contentLib.get({
            key: targetFolderPath
        });
    }
    if (!uploadFolder) {
        log.info('Upload folder not found');
        return [];
    }

    for (var name in multipartForm) {
        part = portal.getMultipartItem(name);

        if (part.fileName && part.size > 0) {
            partBytes = portal.getMultipartBytes(name);

            media = contentLib.createMedia({
                name: part.fileName,
                parentPath: uploadFolder._path,
                mimeType: part.contentType,
                focalX: 0.5,
                focalY: 0.5,
                data: partBytes
            });
            log.info('Media created: %s', media);
            contentIds.push(media._id);
        }
    }
    return contentIds;
}

function getDefaultFolderPath() {
    var uploadFolder;
    var component = portal.getComponent();
    var uploadFolderId = component.config.targetFolder;
    if (uploadFolderId) {
        uploadFolder = contentLib.get({
            key: uploadFolderId
        });
    }
    return uploadFolder ? uploadFolder._path : '';
}

function getCreatedContentFiles(ids) {
    var i, uploadContent, fileUrl, thumbUrl, files = [];
    for (i = 0; i < ids.length; i++) {
        uploadContent = contentLib.get({
            key: ids[i]
        });
        if (uploadContent) {
            if (uploadContent.type === 'media:image') {
                fileUrl = portal.imageUrl({
                    id: uploadContent._id,
                    scale: 'width(600)'
                });
                thumbUrl = portal.imageUrl({
                    id: uploadContent._id,
                    scale: 'width(80)',
                    filter: 'grayscale()'
                });
            } else {
                fileUrl = portal.attachmentUrl({
                    id: uploadContent._id
                });
                thumbUrl = '';
            }
            files.push({
                url: fileUrl,
                thumbUrl: thumbUrl,
                type: uploadContent.type,
                name: uploadContent._name
            });
        }
    }
    return files;
}