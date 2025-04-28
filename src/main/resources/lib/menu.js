const portalLib = require('/lib/xp/portal');
const contentLib = require('/lib/xp/content');
const APPLICATION_NAME = 'com-enonic-app-menu';
const MENU_ITEM_OBJECT_KEY = 'menu-item';

exports.getMenuTree = getRootMenuTree;

function getRootMenuTree() {
    const content = portalLib.getContent();

    return getChildMenuItems({
        parentPath: content._path,
        parentChildOrder: content.childOrder
    });
}

function getChildMenuItems(params) {
    const menuItems = [];

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

    children.hits.forEach((child) => {
        menuItems.push(createMenuItem(child));
    });

    return menuItems.length ? menuItems : null;
}

function createMenuItem(content) {
    const menuItem = content.x[APPLICATION_NAME][MENU_ITEM_OBJECT_KEY];

    return {
        id: content._id,
        title: menuItem.menuName || content.displayName,
        path: content._path,
        name: content._name,
    };
}
