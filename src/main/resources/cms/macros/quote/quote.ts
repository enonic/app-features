const libs = {
    portal: require('/lib/xp/portal'),
    context: require('/lib/xp/context'),
    thymeleaf: require('/lib/thymeleaf') as any,
    encoding: require('/lib/text-encoding') as any
};

function createModel(req: any) {
    const macroBody = libs.encoding.htmlUnescape(req.body);
    const processedMacroBody = libs.context.run({
        repository: req.request.repositoryId,
        branch: "draft",
        authInfo: {
            principals: ["role:system.admin"]
        }
    } as any, () => libs.portal.processHtml({value: macroBody}));

    return {
        quote: {
            name: req.params.name,
            text: processedMacroBody,
        }
    };
}

function getImageUrl(imageId: any) {
    return libs.portal.imageUrl({
        id: imageId,
        scale: 'block(167,167)',
        format: 'jpeg'
    });
}

function getImageUrlInContext(imageId: any, repoId: any) {
    return libs.context.run({
        repository: repoId,
        branch: "draft",
        authInfo: {
            principals: ["role:system.admin"]
        }
    } as any, () => getImageUrl(imageId));
}

export const macro = function(req: any) {
    const view = resolve('quote.html');
    const model = createModel(req);

    if ((model.quote as any).image) {
        (model.quote as any).image = getImageUrlInContext((model.quote as any).image, req.request.repositoryId);
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
};
