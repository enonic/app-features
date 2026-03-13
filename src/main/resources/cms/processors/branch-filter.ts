import * as portal from '/lib/xp/portal';

export const responseProcessor = function(req: any, res: any) {
    const isHtml = (res.contentType.lastIndexOf('text/html', 0) === 0);
    if (isHtml) {
        addPageContribution(res, 'bodyEnd', '<input type="hidden" name="branch" value="' + req.branch + '"/>');
    }

    const scriptUrl = portal.assetUrl({path: 'filters/branch-filter.js'});
    addPageContribution(res, 'bodyEnd', '<script src="' + scriptUrl + '" type="text/javascript"></script>');

    return res;
};

const addPageContribution = function(response: any, tagPos: any, contribution: any) {
    const pageContributions = response.pageContributions || {};
    response.pageContributions = pageContributions;
    let contributions = pageContributions[tagPos] || [];
    contributions = [].concat(contributions);
    pageContributions[tagPos] = contributions;
    contributions.push(contribution);
};
