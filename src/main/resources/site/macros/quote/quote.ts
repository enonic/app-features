import * as portal from '/lib/xp/portal';
import * as context from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import * as encoding from '/lib/text-encoding';
import type { MacroContext } from '@enonic-types/lib-portal';

function createModel(req: MacroContext) {
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

function getImageUrl(imageId: string) {
    return portal.imageUrl({
        id: imageId,
        scale: 'block(167,167)',
        format: 'jpeg'
    });
}

function getImageUrlInContext(imageId: string, repoId: string) {
    return context.run({
        repository: repoId,
        branch: "draft",
        principals: ["role:system.admin"]
    }, () => getImageUrl(imageId));
}

export const macro = function (context: MacroContext) {
    const view = resolve('quote.html');
    const model = createModel(context);

    if (context.params.image) {
        (model.quote as Record<string, unknown>).image = getImageUrlInContext(context.params.image, context.request.repositoryId as string);
    }

    return {
        body: thymeleaf.render(view, model)
    };
};
