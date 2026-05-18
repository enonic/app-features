declare module '@enonic-types/lib-project' {
    function create<Config extends Record<string, unknown> = Record<string, unknown>>(
        params: Omit<CreateProjectParams<Config>, 'readAccess'> & { publicRead: boolean }
    ): Project<Config>;
}

export {};
