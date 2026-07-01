declare module '/lib/sql' {
    export interface ConnectParams {
        url: string;
        driver: string;
        user?: string;
        password?: string;
        maxPoolSize?: number;
        minPoolSize?: number;
        poolName?: string;
    }

    export interface QueryResult {
        count: number;
        result: Record<string, unknown>[];
    }

    export interface Handle {
        query(sql: string, limit?: number | null): QueryResult;
        queryFirst(sql: string): Record<string, unknown> | null;
        insert(sql: string): number;
        update(sql: string): number;
        execute(sql: string): void;
    }

    export function connect(params: ConnectParams): Handle;
}

export {};
