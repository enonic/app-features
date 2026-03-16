import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
import type {Content} from '@enonic-types/core';

export const content = {
    get: function (key?: string): Content | null {
        let result: Content | null;
        if (typeof key == 'undefined') {
            result = portal.getContent();
        } else {
            result = contentSvc.get({
                key: key
            });
        }
        return result;
    },

    exists: function (path: string): boolean {
        return content.get(path) ? true : false;
    },

    getProperty: function (key: string, property: keyof Content): unknown {
        if (!key || !property) {
            return null;
        }
        const result = content.get(key);
        return result ? result[property] : null;
    },

    getPath: function (contentKey: string, noDefault?: boolean): string | null {
        let defaultContent: {_path: string | null} = {_path: ''};
        if (noDefault) {
            defaultContent = {_path: null};
        } else {
            defaultContent = portal.getContent() ?? {_path: ''};
        }

        let contentPath: string | undefined;
        if (contentKey) {
            const c = content.get(contentKey);
            if (c) {
                contentPath = c._path;
            }
        }
        return contentPath ? contentPath : defaultContent._path;
    },

    getParentPath: function (path: string): string {
        const pathArray = path.split('/');
        return pathArray.slice(0, pathArray.length - 1).join('/');
    },

    getParent: function (key: string): Content | null {
        const c = content.get(key);
        const parentPath = content.getParentPath(c._path);
        return parentPath.length < 1 ? null : content.get(parentPath);
    }
};
