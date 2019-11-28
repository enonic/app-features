var eventLib = require('/lib/xp/event');
var context = require('/lib/xp/context');
var content = require('/lib/xp/content');
var nodeLib = require('/lib/xp/node');

var repoDraft = nodeLib.connect({
    repoId: 'com.enonic.cms.default',
    branch: 'draft',
    user: {
        login: 'su',
        userStore: 'system'
    },
    principals: ['role:system.admin']
});

var repoMaster = nodeLib.connect({
    repoId: 'com.enonic.cms.default',
    branch: 'master',
    user: {
        login: 'su',
        userStore: 'system'
    },
    principals: ['role:system.admin']
});

log.info('listener callEndringslogg.....')
eventLib.listener({
    type: 'node.updated',
    localOnly: true,
    callback: function (event) {
        log.info('CAUGHT node.updated event');
        context.run({
            repository: 'com.enonic.cms.default',
            branch: 'draft',
            user: {
                login: 'su',
                idProvider: 'system'
            },
            principals: ['role:system.admin'],
            attributes: {
                'ignorePublishTimes': true
            }
        }, onCallback);

        function onCallback () {
            if (event.type === 'node.updated') {
                for (var i = 0; i < event.data.nodes.length; i++) {
                    var node = event.data.nodes[i];

                    log.info(JSON.stringify(node, null,2));
                    var objNode = content.query({
                        start: 0,
                        count: 2,
                        query: "_id = '" + node.id + "'",
                        branch: "draft"
                    });

                    objNode = objNode.hits.length > 0 ? objNode.hits[0] : null;

                    log.info(JSON.stringify(objNode, null,2));

                    if (objNode) {

                        var findContent = repoMaster.get(objNode._id);

                        if (findContent) {
                            var endringsloggUpdated = (objNode.x && objNode.x[app.name]['innstillinger-endringslogg'])
                                ? utilLib.fieldArray(objNode.x[app.name]['innstillinger-endringslogg'].endringslogg || ['']) : ['']

                            var endringsloggMaster = (findContent.x && findContent.x[app.name]['innstillinger-endringslogg'])
                                ? utilLib.fieldArray(findContent.x[app.name]['innstillinger-endringslogg'].endringslogg || ['']) : ['']

                            if (!objNode.data.menuItem) {
                                repoDraft.modify({
                                    key: objNode._id,
                                    editor: function (f) {
                                        f.data.menuItem = true;
                                        return f
                                    }
                                });

                                repoDraft.modify({
                                    key: objNode._id,
                                    editor: function (f) {
                                        f.data.menuItem = false;
                                        return f
                                    }
                                });

                            } else if (objNode.data.menuItem) {
                                repoDraft.modify({
                                    key: objNode._id,
                                    editor: function (f) {
                                        f.data.endringslogg = false
                                        return f
                                    }
                                })
                            }

                    }
                }
            }
        }
    }
})
