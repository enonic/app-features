import * as contentJsLib from '/lib/jslibraries/content';
import * as nodeJsLib from '/lib/jslibraries/node';

export interface Operation {
    label: string;
    run: () => unknown;
}

export interface Suite {
    label: string;
    operations: Operation[];
}

// One definition of each library suite, used both by the page that renders results directly and by
// the library-probe task that runs the same operations in the background and reports progress.
export const suites: Record<string, Suite> = {
    node: {
        label: 'Lib Node',
        operations: [
            {label: 'create', run: nodeJsLib.create},
            {label: 'modify', run: nodeJsLib.modify},
            {label: 'commit', run: nodeJsLib.commit},
            {label: 'get by key', run: nodeJsLib.getNodeByKey},
            {label: 'get missing by key', run: nodeJsLib.getMissingNodeByKey},
            {label: 'get by several keys', run: nodeJsLib.getNodesByKeys},
            {label: 'exists', run: nodeJsLib.exists},
            {label: 'exists, missing', run: nodeJsLib.existsMissing},
            {label: 'rename', run: nodeJsLib.rename},
            {label: 'move', run: nodeJsLib.move},
            {label: 'move and rename', run: nodeJsLib.moveAndRename},
            {label: 'delete', run: nodeJsLib.deleteNodes},
            {label: 'diff', run: nodeJsLib.diff},
            {label: 'push', run: nodeJsLib.push},
            {label: 'findChildren (deprecated in 8.1)', run: nodeJsLib.findChildren},
            {label: 'query', run: nodeJsLib.query},
            {label: 'query with suggestions', run: nodeJsLib.suggestions},
            {label: 'query with highlight', run: nodeJsLib.highlight},
            {label: 'sort', run: nodeJsLib.sort},
            {label: 'getVersions', run: nodeJsLib.findVersions},
            {label: 'getActiveVersion', run: nodeJsLib.getActiveVersion},
            {label: 'getCommit', run: nodeJsLib.getCommit}
        ]
    },
    content: {
        label: 'Lib Content',
        operations: [
            {label: 'create', run: contentJsLib.create},
            {label: 'get', run: contentJsLib.get},
            {label: 'exists', run: () => contentJsLib.exists('/features/js-libraries/mycontent')},
            {label: 'exists, unknown key', run: () => contentJsLib.exists('unknown')},
            {label: 'getChildren (deprecated in 8.1)', run: contentJsLib.getChildren},
            {label: 'query', run: contentJsLib.query},
            {label: 'publish', run: contentJsLib.publish},
            {label: 'modify', run: contentJsLib.modify},
            {label: 'getPermissions', run: contentJsLib.getPermissions},
            {label: 'applyPermissions', run: contentJsLib.applyPermissions},
            {label: 'getPermissions, after applying', run: contentJsLib.getPermissions},
            {label: 'delete', run: contentJsLib.deleteContent},
            {label: 'publish, after delete', run: contentJsLib.publish}
        ]
    }
};

export interface OperationResult {
    label: string;
    ok: boolean;
    verdict: string;
    output: string;
}

// Runs one operation and reports its outcome instead of throwing, so a failing call neither hides
// the operations after it nor takes down whatever is running the suite.
export function runOperation(operation: Operation): OperationResult {
    try {
        return {
            label: operation.label,
            ok: true,
            verdict: 'ok',
            output: JSON.stringify(operation.run(), null, 4)
        };
    } catch (e) {
        return {
            label: operation.label,
            ok: false,
            verdict: 'FAILED',
            output: (e as Error).message || String(e)
        };
    }
}
