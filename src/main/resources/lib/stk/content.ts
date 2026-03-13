import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';

export const content = {
    get: function(key?: any): any {
        let result: any;
        if (typeof key == 'undefined') {
            result = portal.getContent();
        } else {
            result = contentSvc.get({
                key: key
            });
        }
        return result;
    },

    exists: function(path: any): boolean {
        return content.get(path) ? true : false;
    },

    getProperty: function(key: any, property: any): any {
        if (!key || !property) {
            return null;
        }
        const result = content.get(key);
        return result ? result[property] : null;
    },

    getPath: function(contentKey: any, noDefault?: any): any {
        let defaultContent: any = '';
        if (noDefault) {
            defaultContent = { _path: null };
        } else {
            defaultContent = portal.getContent();
        }

        let contentPath: any;
        if (contentKey) {
            const c = content.get(contentKey);
            if (c) {
                contentPath = c._path;
            }
        }
        return contentPath ? contentPath : (defaultContent as any)._path;
    },

    getParentPath: function(path: any): string {
        const pathArray = path.split('/');
        return pathArray.slice(0, pathArray.length - 1).join('/');
    },

    getParent: function(key: any): any {
        const c = content.get(key);
        const parentPath = content.getParentPath(c._path);
        return parentPath.length < 1 ? null : content.get(parentPath);
    }
};
