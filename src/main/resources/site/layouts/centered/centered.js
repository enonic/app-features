var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');

exports.get = function (req) {
    var component = portal.getComponent();

    return {
        body: thymeleaf.render(resolve('./centered.html'), {
            centerRegion: component.regions["center"]
        })
    };

};
