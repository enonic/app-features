declare module '/lib/router' {
    import type {Request, Response} from '@enonic-types/core';

    type RouterRequest = Request & {
        pathParams: Record<string, string>;
    };
    type RouteHandler = (req: RouterRequest) => Response;
    type Filter = (req: RouterRequest, next: (req: RouterRequest) => Response) => Response;
    type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | '*';

    interface Router {
        route(method: HttpMethod, pattern: string | string[], handler: RouteHandler): void;
        get(pattern: string | string[], handler: RouteHandler): void;
        post(pattern: string | string[], handler: RouteHandler): void;
        put(pattern: string | string[], handler: RouteHandler): void;
        delete(pattern: string | string[], handler: RouteHandler): void;
        patch(pattern: string | string[], handler: RouteHandler): void;
        head(pattern: string | string[], handler: RouteHandler): void;
        all(pattern: string | string[], handler: RouteHandler): void;
        filter(filter: Filter): void;
        dispatch(req: Request): Response;
    }

    const createRouter: () => Router;
    export = createRouter;
}

export {};
