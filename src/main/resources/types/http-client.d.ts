declare module '/lib/http-client' {
    interface HttpRequestProxy {
        host?: string;
        port?: string | number;
        user?: string;
        password?: string;
    }

    interface HttpRequestAuth {
        user?: string;
        password?: string;
    }

    interface HttpRequestParams {
        url: string;
        method?: string;
        contentType?: string;
        body?: string;
        params?: Record<string, string | string[]>;
        headers?: Record<string, string>;
        proxy?: HttpRequestProxy;
        auth?: HttpRequestAuth;
        connectTimeout?: number | string;
        readTimeout?: number | string;
    }

    interface HttpResponse {
        status: number;
        message: string;
        body?: string;
        contentType?: string;
        headers: Record<string, string>;
        cookies: Record<string, string>;
    }

    export function request(params: HttpRequestParams): HttpResponse;
}

export {};
