import * as portal from '/lib/xp/portal';
import * as dataModule from './data';
import * as contentModule from './content';

export const data = dataModule.data;
export const content = contentModule.content;

export function log(data: any): void {
    (globalThis as any).log.info('STK log %s', JSON.stringify(data, null, 4));
}

export function serviceUrl(service: any, params?: any, module?: any): string {
    let url: string;
    if (params && module) {
        url = portal.serviceUrl({
            service: service,
            params: params,
            application: module
        } as any);
    } else if (params) {
        url = portal.serviceUrl({
            service: service,
            params: params
        } as any);
    } else if (module) {
        url = portal.serviceUrl({
            service: service,
            application: module
        } as any);
    } else {
        url = portal.serviceUrl({
            service: service
        } as any);
    }
    return url;
}
