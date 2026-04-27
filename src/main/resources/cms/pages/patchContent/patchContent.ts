import * as thymeleaf from '/lib/thymeleaf';
import * as contentLib from '/lib/xp/content';
import type {Request} from '@enonic-types/core';
import type {UserKey} from '@enonic-types/core';

const view = resolve('./patchContent.page.html');

const BRANCH_ORDER = ['master', 'draft'];

type FormState = {
    key: string;
    updateDisplayName: boolean;
    displayName: string;
    updateLanguage: boolean;
    language: string;
    updateOwner: boolean;
    owner: string;
    updateData: boolean;
    dataField: string;
    dataValue: string;
    branchMaster: boolean;
    branchDraft: boolean;
    skipSync: boolean;
    errorMsg?: string;
    msg?: string;
    result?: string;
};

function render(state: FormState) {
    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, state)
    };
}

function emptyState(): FormState {
    return {
        key: '',
        updateDisplayName: false,
        displayName: '',
        updateLanguage: false,
        language: '',
        updateOwner: false,
        owner: '',
        updateData: false,
        dataField: '',
        dataValue: '',
        branchMaster: false,
        branchDraft: false,
        skipSync: false
    };
}

function handleGet(_req: Request) {
    return render(emptyState());
}

function paramAsBool(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value === 'true' || value === 'on';
}

function paramAsString(value: unknown): string {
    if (Array.isArray(value)) {
        return value[0] != null ? String(value[0]) : '';
    }
    return value != null ? String(value) : '';
}

function handlePost(req: Request) {
    const params = (req.params ?? {}) as Record<string, string | string[] | undefined>;

    const state: FormState = {
        key: paramAsString(params.key),
        updateDisplayName: paramAsBool(params.updateDisplayName),
        displayName: paramAsString(params.displayName),
        updateLanguage: paramAsBool(params.updateLanguage),
        language: paramAsString(params.language),
        updateOwner: paramAsBool(params.updateOwner),
        owner: paramAsString(params.owner),
        updateData: paramAsBool(params.updateData),
        dataField: paramAsString(params.dataField),
        dataValue: paramAsString(params.dataValue),
        branchMaster: paramAsBool(params.branchMaster),
        branchDraft: paramAsBool(params.branchDraft),
        skipSync: paramAsBool(params.skipSync)
    };

    if (!state.key) {
        state.errorMsg = 'Content key is required';
        return render(state);
    }

    const branches = BRANCH_ORDER.filter(b =>
        (b === 'master' && state.branchMaster) || (b === 'draft' && state.branchDraft)
    );

    try {
        const result = contentLib.patch({
            key: state.key,
            patcher: (content) => {
                if (state.updateDisplayName) {
                    content.displayName = state.displayName;
                }
                if (state.updateLanguage) {
                    content.language = state.language;
                }
                if (state.updateOwner) {
                    content.owner = state.owner as UserKey;
                }
                if (state.updateData && state.dataField) {
                    content.data = content.data || {};
                    (content.data as Record<string, unknown>)[state.dataField] = state.dataValue;
                }
                return content;
            },
            branches: branches,
            skipSync: state.skipSync
        });

        state.msg = 'Content patched: ' + result.contentId;
        state.result = JSON.stringify(result, null, 4);
    } catch (e) {
        state.errorMsg = 'Error: ' + (e as Error).message;
    }

    return render(state);
}

export {handleGet as GET, handlePost as POST};
