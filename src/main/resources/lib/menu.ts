import * as portalLib from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
import type {Content} from '@enonic-types/core';

interface MenuParams {
    parentPath: string;
    parentChildOrder?: string;
}

const APPLICATION_NAME = 'com-enonic-app-menu';
const MENU_ITEM_OBJECT_KEY = 'menu-item';

export {getRootMenuTree as getMenuTree};

function getRootMenuTree() {
    const content = portalLib.getContent();

    return getChildMenuItems({
        parentPath: content._path,
        parentChildOrder: content.childOrder
    });
}

function getChildMenuItems(params: MenuParams) {
    const menuItems: {id: string; title: string; path: string; name: string}[] = [];

    const children = contentLib.query({
        count: 1000,
        query: {
            boolean: {
                must: [
                    {
                        like: {
                            field: '_path',
                            value: `/content${params.parentPath === '/' ? '' : params.parentPath}/*`,
                        },
                    },
                    {
                        term: {
                            field: `x.${APPLICATION_NAME}.${MENU_ITEM_OBJECT_KEY}.menuItem`,
                            value: true,
                        },
                    },
                ]
            }
        },
        sort: params.parentChildOrder
    });

    children.hits.forEach((child: Content) => {
        menuItems.push(createMenuItem(child));
    });

    return menuItems.length ? menuItems : null;
}

function createMenuItem(content: Content) {
    const menuItem = content.x[APPLICATION_NAME][MENU_ITEM_OBJECT_KEY];

    return {
        id: content._id,
        title: (menuItem as Record<string, unknown>).menuName as string || content.displayName,
        path: content._path,
        name: content._name,
    };
}
