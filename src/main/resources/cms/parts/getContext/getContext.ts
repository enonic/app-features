import * as contextLib from '/lib/xp/context';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('getContext.html');

function handleGet(req: any) {
    const context = contextLib.get();

    const contextString = JSON.stringify(context);

    const executed = contextLib.run(context as any, callback);

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

export { handleGet as get };
