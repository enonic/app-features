import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {PartComponent, Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const idsParam = req.params.ids as string;
    const ids = idsParam ? idsParam.split(',') : [];

    const postUrl = portal.componentUrl({});
    const redirectPageId = portal.getContent()._id;
    const files = getCreatedContentFiles(ids);

    const params = {
        postUrl: postUrl,
        multipartRedirect: redirectPageId,
        files: files.length > 0 ? files : null,
        targetFolder: getDefaultFolderPath()
    };

    const view = resolve('multipart.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

export const POST = function (req: Request) {
    const multipartForm = portal.getMultipartForm();
    log.info('Multipart %s', multipartForm);
    const contentIds = createMedia(multipartForm);

    const pageId = portal.getMultipartText('multipartRedirect');
    const redirectUrl = portal.pageUrl({
        id: pageId,
        params: {
            ids: contentIds.join(',')
        }
    });

    return {
        redirect: redirectUrl
    };
};

function createMedia(multipartForm: any) {
    let uploadFolder: any, media: any, part: any;
    const contentIds: any[] = [];

    const targetFolderPath = portal.getMultipartText('targetFolder');
    if (targetFolderPath) {
        uploadFolder = contentLib.get({
            key: targetFolderPath
        });
    }
    if (!uploadFolder) {
        log.info('Upload folder not found');
        return [];
    }

    for (const name in multipartForm) {
        const fileCount = multipartForm[name].length || 1;

        for (let idx = 0; idx < fileCount; idx++) {
            part = portal.getMultipartItem(name, idx);

            if (part.fileName && part.size > 0) {
                media = contentLib.createMedia({
                    name: part.fileName,
                    parentPath: uploadFolder._path,
                    mimeType: part.contentType,
                    focalX: 0.5,
                    focalY: 0.5,
                    data: portal.getMultipartStream(name, idx)
                });
                log.info('Media created: %s', media);
                contentIds.push(media._id);
            }
        }
    }
    return contentIds;
}

function getDefaultFolderPath() {
    let uploadFolder: any;
    const component = portal.getComponent<PartComponent>();
    const uploadFolderId = component?.config.targetFolder as string | undefined;
    if (uploadFolderId) {
        uploadFolder = contentLib.get({
            key: uploadFolderId
        });
    }
    return uploadFolder ? uploadFolder._path : '';
}

function getCreatedContentFiles(ids: any[]) {
    let uploadContent: any, fileUrl: any, thumbUrl: any;
    const files: any[] = [];
    for (let i = 0; i < ids.length; i++) {
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
