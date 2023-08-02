const libs = {
    portal: require('/lib/xp/portal'),
    context: require('/lib/xp/context'),
    thymeleaf: require('/lib/thymeleaf')
};

function createModel(req) {
    return {
        quotation: req.params
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

    model.quotation.image = getImageUrlInContext(model.quotation.image, req.request.repositoryId);

    return {
        body: libs.thymeleaf.render(view, model)
    };
};

