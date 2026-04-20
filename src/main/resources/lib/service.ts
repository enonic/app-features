import * as portal from '/lib/xp/portal';

export const service = {
    serviceUrl: function (service: string, params?: object, module?: string): string {
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
};
