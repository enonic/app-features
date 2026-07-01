declare module '/lib/xslt' {
    import type { ResourceKey } from '@enonic-types/core';
    export function render(view: ResourceKey, model: Record<string, unknown>): string;
}

export {};
