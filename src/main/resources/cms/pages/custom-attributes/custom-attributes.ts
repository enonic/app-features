import * as portal from '/lib/xp/portal';
import {get as getContext, run, setCustomLocalAttribute} from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';

const view = resolve('custom-attributes.html');

const FILTER_ATTRIBUTE = 'com.enonic.app.features.filterMessage';
const PAGE_ATTRIBUTE = 'com.enonic.app.features.pageMessage';
const RUN_ATTRIBUTE = 'com.enonic.app.features.runMessage';
const SNAPSHOT_ATTRIBUTE = 'com.enonic.app.features.snapshotMessage';
const REMOVED_ATTRIBUTE = 'com.enonic.app.features.removedMessage';

function attribute(name: string): unknown {
    return getContext().attributes[`custom.${name}`];
}

export const GET = function (req: Request) {
    const content = portal.getContent();

    setCustomLocalAttribute(PAGE_ATTRIBUTE, {
        setBy: 'page',
        path: content._path
    });

    run({}, () => setCustomLocalAttribute(RUN_ATTRIBUTE, 'stored inside run()'));

    const mutable = {value: 'as stored'};
    setCustomLocalAttribute(SNAPSHOT_ATTRIBUTE, mutable);
    mutable.value = 'mutated after the write';

    setCustomLocalAttribute(REMOVED_ATTRIBUTE, 'about to be removed');
    setCustomLocalAttribute(REMOVED_ATTRIBUTE, null);

    const filterMessage = attribute(FILTER_ATTRIBUTE);
    const legacyFlag = (req as Request & {legacyFlag?: unknown}).legacyFlag;
    const runMessage = attribute(RUN_ATTRIBUTE);
    const snapshot = attribute(SNAPSHOT_ATTRIBUTE) as {value?: string} | undefined;
    const removed = attribute(REMOVED_ATTRIBUTE);

    const checks = [
        {
            label: 'Filter attribute is readable by the page',
            expected: 'the string the filter stored before next()',
            actual: filterMessage === undefined ? 'undefined' : String(filterMessage),
            ok: filterMessage === 'set by the filter before next()'
        },
        {
            label: 'Plain request property set by the filter is dropped',
            expected: 'undefined, because req.legacyFlag never crosses the pipeline',
            actual: String(legacyFlag),
            ok: legacyFlag === undefined
        },
        {
            label: 'Value stored inside run() survives after it returns',
            expected: 'the string stored in the nested run() callback',
            actual: runMessage === undefined ? 'undefined' : String(runMessage),
            ok: runMessage === 'stored inside run()'
        },
        {
            label: 'Stored value is a snapshot, not a live reference',
            expected: 'as stored, even though the source object was mutated afterwards',
            actual: snapshot?.value === undefined ? 'undefined' : String(snapshot.value),
            ok: snapshot?.value === 'as stored'
        },
        {
            label: 'Storing null removes the attribute',
            expected: 'undefined',
            actual: removed === undefined ? 'undefined' : String(removed),
            ok: removed === undefined
        }
    ];

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            content,
            checks,
            editable: req.mode === 'edit',
            attributes: JSON.stringify(getContext().attributes, null, 2),
            stylesUrl: assetUrl({path: 'styles.css'}),
            scriptUrl: assetUrl({path: 'js/pages/custom-attributes/custom-attributes.js'})
        })
    };
};
