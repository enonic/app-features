import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as contentSvc from '/lib/xp/content';
import {assetUrl} from '/lib/enonic/asset';
import type {Content, PartComponent, Request} from '@enonic-types/core';

const view = resolve('cities-list.page.html');

const CITY_TYPE = app.name + ':city';

interface Row {
    name: string;
    displayName: string;
    location: string;
    distance: string;
    url: string;
}

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function cityByName(name: string) {
    return contentSvc.query({
        count: 1,
        contentTypes: [CITY_TYPE],
        query: {term: {field: '_name', value: name}}
    }).hits[0];
}

// With a sort expression the hits carry the computed sort values in `_sort`. For a geoDistance
// sort that value is the distance itself, which is what makes the reordering visible: without it
// the rows only show coordinates, which never change however the list is sorted.
function distanceOf(city: Content): string {
    const sort = city._sort as unknown as number[] | undefined;
    const value = sort && sort.length !== 0 ? Number(sort[0]) : NaN;

    if (isNaN(value) || value === Number.MAX_VALUE) {
        return '';
    }
    return value < 10 ? value.toFixed(1) + ' km' : Math.round(value) + ' km';
}

function handleGet(req: Request) {
    const from = firstValue(req.params.city);
    const reference = from ? cityByName(from) : undefined;

    const cities = reference
        ? contentSvc.query({
            start: 0,
            count: 25,
            contentTypes: [CITY_TYPE],
            // The unit belongs in the expression: without it the sort values come back in the
            // default unit, which is not what the rows claim to show.
            sort: "geoDistance('data.cityLocation','" + reference.data.cityLocation + "','km')",
            // Compare against the name, not the display name. The two differ for most of these
            // cities, so comparing display names left the reference city in its own list.
            query: {boolean: {mustNot: {term: {field: '_name', value: from}}}}
        })
        : contentSvc.query({
            start: 0,
            count: 25,
            contentTypes: [CITY_TYPE]
        });

    const content = portal.getContent();
    const currentPage = portal.pageUrl({path: content._path});

    const rows: Row[] = cities.hits.map((city) => ({
        name: city._name,
        displayName: city.displayName,
        location: String((city.data as {cityLocation?: string}).cityLocation ?? ''),
        distance: reference ? distanceOf(city) : '',
        url: currentPage + '?city=' + encodeURIComponent(city._name)
    }));

    const part = portal.getComponent<PartComponent>();

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            rows,
            hasRows: rows.length !== 0,
            // The descriptor's default, used when the component carries no config of its own.
            title: (part?.config.title as string | undefined) || 'Cities list',
            reference: reference ? reference.displayName : '',
            hasReference: !!reference,
            currentPage,
            scriptUrl: assetUrl({path: 'js/parts/cities-list/cities-list.js'})
        })
    };
}

export {handleGet as GET};
