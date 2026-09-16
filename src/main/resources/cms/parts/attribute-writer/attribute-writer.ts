import {getComponent} from '/lib/xp/portal';
import {setCustomLocalAttribute} from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import type {PartComponent} from '@enonic-types/core';

const view = resolve('attribute-writer.html');

const PART_ATTRIBUTE = 'com.enonic.app.features.partMessage';

export const GET = function () {
    const component = getComponent<PartComponent>();
    const message = (component?.config.message as string | undefined) || 'Hello from the attribute-writer part';

    setCustomLocalAttribute(PART_ATTRIBUTE, {setBy: 'part', message});

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {message})
    };
};
