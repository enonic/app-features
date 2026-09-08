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
            {label: 'sort', run: nodeJsLib.sort},
            {label: 'query', run: nodeJsLib.query},
            {label: 'query with suggestions', run: nodeJsLib.suggestions},
            {label: 'query with highlight', run: nodeJsLib.highlight},
            {label: 'getVersions', run: nodeJsLib.findVersions},
            {label: 'getActiveVersion', run: nodeJsLib.getActiveVersion},
            {label: 'getCommit', run: nodeJsLib.getCommit}
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
