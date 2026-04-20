import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
import * as stk from '/lib/stk/stk';
import type {Request} from '@enonic-types/core';

export {handlePost as POST};

function handlePost(req: Request) {
    const contentData = req.params;
    let contentCreated = null;
    const contentItem = stk.content.get(contentData.content_ID as string);
    let contentFolder: ReturnType<typeof contentSvc.create> | undefined;
    let saveLocation: string;

    if (stk.content.exists(contentItem._path + '/content')) {
        saveLocation = contentItem._path + '/content';
    } else {
        contentFolder = contentSvc.create({
            name: 'content',
            parentPath: contentItem._path,
            displayName: 'Content',
            requireValid: true,
            contentType: 'base:folder',
            data: {}
        });

        saveLocation = contentFolder._path;
    }

    const contentName = 'Content-' + Math.floor((Math.random() * 1000000000) + 1);

    const newContent = contentSvc.create({
        name: contentName,
        parentPath: saveLocation,
        displayName: contentName,
        requireValid: true,
        contentType: app.name + ':all-input-types',
        data: {
            myDateTime: contentData.datetime,
            myCheckbox: contentData.checkbox,
            myGeoPoint: contentData.geopoint,
            myDate: contentData.date,
            myComboBox: contentData.combobox,
            myDouble: contentData.double,
            myHtmlArea: contentData.htmlarea,
            myLong: contentData.long,
            myTextLine: contentData.textline,
            myTextArea: contentData.textarea,
            myTime: contentData.time,
            myXml: contentData.xml,
            myTag: contentData.tag,
            myRadioButton: contentData.radio
        }
    });

    if (newContent._id) {
        contentCreated = true;
        stk.logStk('New content created with id ' + newContent._id);
    } else {
        stk.logStk('Something went wrong creating content for ' + contentItem.displayName);
    }

    return {
        redirect: portal.pageUrl({
            path: contentItem._path,
            params: {
                submitted: contentCreated ? 'ok' : null,
                contentId: contentCreated ? newContent._id : null
            }
        })
    };
}
