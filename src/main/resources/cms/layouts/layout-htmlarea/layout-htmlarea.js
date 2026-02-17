var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');

exports.get = function (req) {
    var editMode = req.mode == 'edit';

    var content = portal.getContent();
    var component = portal.getComponent();

    var view = resolve('layout-htmlarea.html');
    var body = thymeleaf.render(view, {
        title: content.displayName,
        path: content.path,
        name: content.name,
        editable: editMode,
        resourcesPath: portal.assetUrl({}),
        component: component,
        centerRegion: component.regions["center"]
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};
