import * as portal from '/lib/xp/portal';
import * as context from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import * as encoding from '/lib/text-encoding';

function createModel(req: any) {
    const macroBody = encoding.htmlUnescape(req.body);
    const processedMacroBody = context.run({
        repository: req.request.repositoryId,
        branch: "draft",
        principals: ["role:system.admin"]
    }, () => portal.processHtml({value: macroBody}));

    return {
        quote: {
            name: req.params.name,
            text: processedMacroBody,
        }
    };
}

function getImageUrl(imageId: any) {
    return portal.imageUrl({
        id: imageId,
        scale: 'block(167,167)',
        format: 'jpeg'
    });
}

function getImageUrlInContext(imageId: any, repoId: any) {
    return context.run({
        repository: repoId,
        branch: "draft",
        principals: ["role:system.admin"]
    }, () => getImageUrl(imageId));
}

export const macro = function (context: any) {
    const view = resolve('quote.html');
    const model = createModel(context);

    if ((model.quote as any).image) {
        (model.quote as any).image = getImageUrlInContext((model.quote as any).image, context.request.repositoryId);
    }

    return {
        body: thymeleaf.render(view, model)
    };
};
