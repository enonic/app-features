import * as contentSvc from '/lib/xp/content';

export function getChildren(parentPath: string, size?: number) {
    return contentSvc.getChildren({
        key: parentPath,
        start: 0,
        count: size ? size : 500
    });
}

export function getContentById(contentId: string) {
    return contentSvc.get({
        key: contentId
    });
}
