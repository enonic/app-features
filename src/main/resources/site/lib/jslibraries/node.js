var nodeLib = require('/lib/xp/node.js');

exports.create = function () {
    var result = nodeLib.create({
        _name: "myName",
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

exports.getNodeByKeyResult = function () {
    return get({
        key: '/content/features'
    });
};

exports.getMissingNodeByKeyResult = function () {
    return get({
        key: 'missing'
    });
};

exports.getNodesByKeysResult = function () {
    return get({
        keys: ['/content/features', 'missing']
    });
};

function get(params) {
    var result = nodeLib.get(params);

    return result;
}