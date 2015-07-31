var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentSvc = require('/lib/xp/content');

var scaleOptions = [
    {name: 'Scale Max', value: 'max(600)'},
    {name: 'Scale Wide', value: 'wide(600,200)'},
    {name: 'Scale Block V', value: 'block(600,200)'},
    {name: 'Scale Block H', value: 'block(200,600)'},
    {name: 'Scale Square', value: 'square(600)'},
    {name: 'Scale Width', value: 'width(600)'},
    {name: 'Scale Height', value: 'height(600)'}
];

var filterOptions = [
    {name: '-- No Filter --', value: ''},
    {name: 'Block', value: 'block(10)'},
    {name: 'Blur', value: 'blur(10)'},
    {name: 'Border', value: 'border(2,255)'},
    {name: 'Emboss', value: 'emboss()'},
    {name: 'Gray Scale', value: 'grayscale()'},
    {name: 'Invert', value: 'invert()'},
    {name: 'Rounded', value: 'rounded(10,0,0)'},
    {name: 'Sharpen', value: 'sharpen()'},
    {name: 'RGB Adjust', value: 'rgbadjust(100,0,100)'},
    {name: 'HSB Adjust', value: 'hsbadjust(0,0,0)'},
    {name: 'Edge', value: 'edge()'},
    {name: 'Bump', value: 'bump()'},
    {name: 'Sepia', value: 'sepia(20)'},
    {name: 'Rotate 90', value: 'rotate90()'},
    {name: 'Rotate 180', value: 'rotate180()'},
    {name: 'Rotate 270', value: 'rotate270()'},
    {name: 'Flip horizontal', value: 'fliph()'},
    {name: 'Flip vertical', value: 'flipv()'},
    {name: 'Colorize', value: 'colorize(1,1,1)'},
    {name: 'Colorize HSB', value: 'hsbcolorize(0xFFFFFFFF)'}
];

exports.get = function (req) {
    var images = getImages(), img;
    for (var i = 0; i < images.length; i++) {
        img = images[i];
        img.url = defaultImageUrl(img.id);
    }

    var postUrl = portal.componentUrl({});
    var params = {
        images: images,
        postUrl: postUrl,
        scaleOptions: scaleOptions,
        filterOptions: filterOptions
    };

    var view = resolve('images.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/images-part.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };

};

exports.post = function (req) {
    var filter = req.formParams.filter;
    var scale = req.formParams.scale;

    var images = getImages(), img;
    for (var i = 0; i < images.length; i++) {
        img = images[i];
        img.url = portal.imageUrl({
            id: img.id,
            scale: scale,
            filter: filter
        });
    }

    return {
        contentType: 'application/json',
        body: {
            images: images
        }
    };
};

function getImages() {
    var component = portal.getComponent();

    var imageFolderId = component.config.imageFolder;
    var images = [];
    if (imageFolderId) {
        var result = contentSvc.getChildren({
            key: imageFolderId,
            count: 20
        });

        for (var i = 0; i < result.contents.length; i++) {
            var child = result.contents[i];
            if (child.type === "media:image") {
                var media = child.x.media || {};
                var info = media['image-info'] || {};
                images.push({
                    id: child._id,
                    width: info.imageWidth || '?',
                    height: info.imageHeight || '?',
                    bytesize: info.bytesize || '?'
                });
            }
        }
    }
    return images;
}

function defaultImageUrl(contentId) {
    return portal.imageUrl({
        id: contentId,
        scale: 'wide(600,400)'
    });
}
