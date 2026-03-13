import * as portal from '/lib/xp/portal';

export const service = {
    serviceUrl: function(service: any, params?: any, module?: any): string {
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
};
