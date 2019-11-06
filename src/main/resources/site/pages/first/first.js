var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');

var view = resolve('first.html');


var handleRequest = function (req) {
  var content = portal.getContent();

  return {
    postProcess: true,
    body: thymeleaf.render(view, {
      mainRegion: content.page.regions.main,
      title: "Public page with " + req.method
    })
  }
};

exports.get = handleRequest;
exports.post = handleRequest;