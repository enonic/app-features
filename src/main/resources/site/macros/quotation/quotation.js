const libs = {
    portal: require('/lib/xp/portal'),
    context: require('/lib/xp/context'),
    thymeleaf: require('/lib/thymeleaf'),
    encoding: require('/lib/text-encoding')
};

function createModel(req) {
    const macroBody = libs.encoding.htmlUnescape(req.body);
    const processedMacroBody = libs.context.run({
        repository: req.request.repositoryId,
        branch: "draft",
        authInfo: {
            principals: ["role:system.admin"]
        }
    }, () => libs.portal.processHtml({value: macroBody}));

    return {
        quotation: {
            name: req.params.name,
            text: processedMacroBody,
        }
    };
}

function getImageUrl(imageId) {
    return libs.portal.imageUrl({
        id: imageId,
        scale: 'block(167,167)',
        format: 'jpeg'
    })
}

function getImageUrlInContext(imageId, repoId) {
    return libs.context.run({
        repository: repoId,
        branch: "draft",
        authInfo: {
            principals: ["role:system.admin"]
        }
    }, () => getImageUrl(imageId));
}

exports.macro = function (req) {
    const view = resolve('quotation.html');
    const model = createModel(req);

    if (model.quotation.image) {
        model.quotation.image = getImageUrlInContext(model.quotation.image, req.request.repositoryId);
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
};

