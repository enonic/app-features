import type { Request, MappedResponse } from '@enonic-types/core';
import { assetUrl } from '/lib/enonic/asset';

export const responseProcessor = function(req: Request, res: MappedResponse) {
    const isHtml = (res.contentType.lastIndexOf('text/html', 0) === 0);
    if (isHtml) {
        addPageContribution(res, 'bodyEnd', '<input type="hidden" name="branch" value="' + req.branch + '"/>');
    }

    const scriptUrl = assetUrl({path: 'filters/branch-filter.js'});
    addPageContribution(res, 'bodyEnd', '<script src="' + scriptUrl + '" type="text/javascript"></script>');

    return res;
};

const addPageContribution = function(response: MappedResponse, tagPos: keyof MappedResponse['pageContributions'], contribution: string) {
    const pageContributions = response.pageContributions || {};
    response.pageContributions = pageContributions;
    let contributions = pageContributions[tagPos] || [];
    contributions = [].concat(contributions);
    pageContributions[tagPos] = contributions;
    contributions.push(contribution);
};
