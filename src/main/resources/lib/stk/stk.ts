import * as portal from '/lib/xp/portal';
import * as dataModule from './data';
import * as contentModule from './content';

export const data = dataModule.data;
export const content = contentModule.content;

export function logStk(data: unknown): void {
    log.info('STK log %s', JSON.stringify(data, null, 4));
}

export function serviceUrl(service: string, params?: object, module?: string): string {
    let url: string;
    if (params && module) {
        url = portal.serviceUrl({
            service: service,
            params: params,
            application: module
        });
    } else if (params) {
        url = portal.serviceUrl({
            service: service,
            params: params
        });
    } else if (module) {
        url = portal.serviceUrl({
            service: service,
            application: module
        });
    } else {
        url = portal.serviceUrl({
            service: service
        });
    }
    return url;
}
