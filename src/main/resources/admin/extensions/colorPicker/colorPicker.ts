import type { Request, RequestParams } from '@enonic-types/core';

interface CustomSelectorHelper {
    parseparams(params: RequestParams): unknown;
    createresults(items: unknown[], params: unknown): string;
}
const helper = require('/lib/custom-selector-helper') as CustomSelectorHelper;

function handleGet(req: Request) {
    const params = helper.parseparams(req.params);
    const body = helper.createresults(getItems(), params);

    return {
        contentType: 'application/json',
        body: body
    };
}

export { handleGet as GET };

function getItems() {
    return [
        getItemFor('#FFFFFF', 'White'),
        getItemFor('#C0C0C0', 'Silver'),
        getItemFor('#808080', 'Gray'),
        getItemFor('#000000', 'Black'),
        getItemFor('#FF0000', 'Red'),
        getItemFor('#800000', 'Maroon'),
        getItemFor('#FFFF00', 'Yellow'),
        getItemFor('#808000', 'Olive'),
        getItemFor('#00FF00', 'Lime'),
        getItemFor('#008000', 'Green'),
        getItemFor('#00FFFF', 'Aqua'),
        getItemFor('#008080', 'Teal'),
        getItemFor('#0000FF', 'Blue'),
        getItemFor('#000080', 'Navy'),
        getItemFor('#FF00FF', 'Fuchsia'),
        getItemFor('#800080', 'Purple')
    ];
}

function getItemFor(color: string, desc: string) {
    return {
        id: color,
        displayName: color,
        description: desc,
        icon: getIconFor(color)
    };
}

function getIconFor(color: string) {
    return {
        data: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">' +
        '<rect x="0" y="0" width="32" height="32" rx="4" ry="4" fill="' + color + '"/>' +
        '</svg>',
        type: 'image/svg+xml'
    };
}
