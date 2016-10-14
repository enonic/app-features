var nodeLib = require('/lib/xp/node.js');

exports.create = function () {
    var result = nodeLib.create({
        _name: "my-name",
        displayName: "This is brand new node",
        someData: {
            cars: [
                "skoda", "tesla model X"
            ],
            likes: "plywood",
            numberOfUselessGadgets: 123
        },
        _indexConfig: {
            default: "minimal",
            configs: {
                path: "displayName",
                config: "fulltext"
            }
        },
        _permissions: [
            {
                "principal": "user:system:anonymous",
                "allow": [
                    "READ"
                ],
                "deny": []
            },
            {
                "principal": "role:admin",
                "allow": [
                    "READ",
                    "CREATE",
                    "MODIFY",
                    "DELETE",
                    "PUBLISH",
                    "READ_PERMISSIONS",
                    "WRITE_PERMISSIONS"
                ],
                "deny": []
            }
        ]
    });

    return result;
};

exports.getNodeByKey = function () {
    return get({
        key: '/my-name'
    });
};

exports.getMissingNodeByKey = function () {
    return get({
        key: 'missing'
    });
};

exports.getNodesByKeys = function () {
    return get({
        keys: ['/my-name', 'missing']
    });
};

exports.rename = function () {
    return nodeLib.move({
        source: '/my-name',
        target: 'new-name'
    });
};

exports.move = function () {
    nodeLib.create({
        _name: "parent"
    });
    return nodeLib.move({
        source: '/new-name',
        target: '/parent/'
    });
};

exports.moveAndRename = function () {
    nodeLib.create({
        _name: "new-parent"
    });
    var movedNode = nodeLib.move({
        source: '/parent/new-name',
        target: '/new-parent/newer-name'
    });
    nodeLib.delete({
        key: "/parent"
    });
    return movedNode;
};

exports.delete = function () {
    return nodeLib.delete({
        keys: ['/new-parent', 'missing']
    });
};

function get(params) {
    var result = nodeLib.get(params);

    return result;
}