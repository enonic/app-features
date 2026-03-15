import * as contextLib from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('getContext.html');

function handleGet(req: Request) {
    const context = contextLib.get();

    const contextString = JSON.stringify(context);

    const executed = contextLib.run(context, callback);

    const params = {
        context: context,
        executedResult: executed
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

function callback() {
    return 'Hello from context';
}

export {handleGet as GET};
