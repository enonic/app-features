import * as portalLib from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';

const APPLICATION_NAME = 'com-enonic-app-menu';
const MENU_ITEM_OBJECT_KEY = 'menu-item';

export { getRootMenuTree as getMenuTree };

function getRootMenuTree() {
    const content = portalLib.getContent() as any;

    return getChildMenuItems({
        parentPath: content._path,
        parentChildOrder: content.childOrder
    });
}

function getChildMenuItems(params: any) {
    const menuItems: any[] = [];

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
    } as any);

    children.hits.forEach((child: any) => {
        menuItems.push(createMenuItem(child));
    });

    return menuItems.length ? menuItems : null;
}

function createMenuItem(content: any) {
    const menuItem = content.x[APPLICATION_NAME][MENU_ITEM_OBJECT_KEY];

    return {
        id: content._id,
        title: menuItem.menuName || content.displayName,
        path: content._path,
        name: content._name,
    };
}
