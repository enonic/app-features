var nodeLib = require('/lib/xp/node.js');
var repoLib = require('/lib/xp/repo.js');
var testRepoId = "features-node-test-repo";

var initialize = function () {
    cleanUp();
    repoLib.create({
        id: testRepoId
    });
};

var connect = function () {
    return nodeLib.connect({
        repoId: testRepoId,
        branch: 'master'
    });
};

var cleanUp = function () {

    var repo = repoLib.get({
        id: testRepoId
    });

    if (repo) {
        repoLib.delete({
            id: testRepoId
        });
    }
};

function createMyNameNode() {
    initialize();

    var repo = connect();

    var result = repo.create({
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
}
exports.create = function () {
    var node = createMyNameNode();
    cleanUp();
    return node;
};

exports.getNodeByKey = function () {
    initialize();
    createMyNameNode();
    var node = get({
        key: '/my-name'
    });
    cleanUp();

    return node;
};

exports.getMissingNodeByKey = function () {
    initialize();
    createMyNameNode();
    var node = get({
        key: 'missing'
    });
    cleanUp();
    return node;
};

exports.getNodesByKeys = function () {
    initialize();
    createMyNameNode();
    var node = get({
        keys: ['/my-name', 'missing']
    });
    cleanUp();
    return node;
};

exports.rename = function () {
    initialize();
    createMyNameNode();
    var repo = connect();
    return repo.move({
        source: '/my-name',
        target: 'new-name'
    });
    cleanUp();
};

exports.move = function () {
    initialize();
    var repo = connect();

    createMyNameNode();

    repo.create({
        _name: "parent"
    });

    var result = repo.move({
        source: '/my-name',
        target: '/parent/'
    });

    cleanUp();

    return result;
};

exports.moveAndRename = function () {
    initialize();

    var repo = connect();

    createMyNameNode();

    return repo.create({
        _name: "new-parent"
    });

    var movedNode = repo.move({
        source: '/my-name',
        target: '/new-parent/newer-name'
    });
    repo.delete({
        key: "/parent"
    });

    cleanUp();

    return movedNode;
};

exports.delete = function () {
    initialize();
    createMyNameNode();
    var repo = connect();
    return repo.delete({
        keys: ['/my-name', 'missing']
    });
};

exports.diff = function () {
    initialize();
    createMyNameNode();
    var repo = connect();
    var diff = repo.diff({
        key: '/my-name',
        target: 'draft'
    });
    cleanUp();
    return diff;
};

exports.push = function () {
    initialize();
    createMyNameNode();

    var anotherBranch = repoLib.createBranch({
        repoId: testRepoId,
        branchId: 'anotherBranch'
    });

    var repo = connect();

    var push = repo.push({
        key: '/my-name',
        target: 'anotherBranch'
    });

    cleanUp();
    return push;
};


function get(params) {
    var repo = connect();
    return repo.get(params);
}