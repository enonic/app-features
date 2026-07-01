declare module '/lib/cache' {
    interface CacheOptions {
        size: number;
        expire?: number;
    }

    interface Cache {
        get<T>(key: string, callback: () => T): T;
        getIfPresent<T>(key: string): T | null;
        put(key: string, value: unknown): void;
        clear(): void;
        getSize(): number;
        remove(key: string): void;
        removePattern(keyRegex: string): void;
    }

    export function newCache(options: CacheOptions): Cache;
}

export {};
