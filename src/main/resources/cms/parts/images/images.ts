import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

const scaleOptions = [
    {name: 'Scale Max', value: 'max(600)'},
    {name: 'Scale Wide', value: 'wide(600,200)'},
    {name: 'Scale Block V', value: 'block(600,200)'},
    {name: 'Scale Block H', value: 'block(200,600)'},
    {name: 'Scale Square', value: 'square(600)'},
    {name: 'Scale Width', value: 'width(600)'},
    {name: 'Scale Height', value: 'height(600)'},
    {name: 'Source', value: '(1,1)'}
];

const filterOptions = [
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

export const GET = function(req: any) {
    const images = getImages();
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        img.url = defaultImageUrl(img.id);
    }

    const postUrl = portal.componentUrl({});
    const params = {
        images: images,
        postUrl: postUrl,
        scaleOptions: scaleOptions,
        filterOptions: filterOptions
    };

    const view = resolve('images.html');
    const body = thymeleaf.render(view, params);

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

export const POST = function(req: any) {
    const filter = req.params.filter;
    const scale = req.params.scale;

    const images = getImages();
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
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
    const component = portal.getComponent() as any;

    const imageFolderId = component.config.imageFolder;
    const images: any[] = [];
    if (imageFolderId) {
        const result = contentSvc.getChildren({
            key: imageFolderId,
            count: 20
        });

        for (let i = 0; i < result.hits.length; i++) {
            const child = result.hits[i] as any;
            if (child.type === "media:image") {
                const media = (child.x as any).media || {};
                const info = media['imageInfo'] || {};
                images.push({
                    id: child._id,
                    width: info.imageWidth || '?',
                    height: info.imageHeight || '?',
                    byteSize: info.byteSize || '?'
                });
            }
        }
    }
    return images;
}

function defaultImageUrl(contentId: any) {
    return portal.imageUrl({
        id: contentId,
        scale: 'wide(600,400)'
    });
}
