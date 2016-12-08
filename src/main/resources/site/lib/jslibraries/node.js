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

function createNode(name) {
    var repo = connect();

    var result = repo.create({
        _name: name,
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
    initialize();
    var node = createNode('my-node');
    cleanUp();
    return node;
};

exports.getNodeByKey = function () {
    initialize();
    createNode('my-name');
    var node = connect().get('/my-name');
    cleanUp();

    return node;
};

exports.getMissingNodeByKey = function () {
    initialize();
    return connect().get('missing');
};

exports.getNodesByKeys = function () {
    initialize();
    createNode('node1');
    createNode('node2');
    return connect().get('/node1', '/node2');
};

exports.rename = function () {
    initialize();
    createNode('my-name');
    var repo = connect();
    return repo.move({
        source: '/my-name',
        target: 'new-name'
    });
};

exports.move = function () {
    initialize();
    createNode('my-name');
    createNode('parent');

    var repo = connect();
    return repo.move({
        source: '/my-name',
        target: '/parent/'
    });
};

exports.moveAndRename = function () {
    initialize();
    createNode('my-name');
    createNode('new-parent');

    var repo = connect();
    return repo.move({
        source: '/my-name',
        target: '/new-parent/newer-name'
    });
};

exports.delete = function () {
    initialize();
    createNode('my-name');
    var repo = connect();
    return repo.delete({
        keys: ['/my-name', 'missing']
    });
};

exports.diff = function () {
    initialize();
    createNode('my-name');
    var repo = connect();
    return repo.diff({
        key: '/my-name',
        target: 'draft'
    });
};

exports.push = function () {
    initialize();
    createNode('my-name');

    var anotherBranch = repoLib.createBranch({
        repoId: testRepoId,
        branchId: 'anotherBranch'
    });

    var repo = connect();

    return repo.push({
        key: '/my-name',
        target: 'anotherBranch'
    });
};

exports.findChildren = function () {
    initialize();
    createNode('my-name');

    var repo = connect();
    repo.create({
        _name: "child1",
        _parentPath: "/my-name"
    });
    repo.create({
        _name: "child2",
        _parentPath: "/my-name"
    });

    repo.refresh();

    return repo.findChildren({
        parentKey: "/my-name"
    });
};

exports.query = function () {
    initialize();
    createNode("my-name");
    createNode("my-name-name");
    createNode("my-other-name");
    createNode("my-third-name");

    var repo = connect();
    repo.refresh();
    
    return repo.query({
        query: "fulltext('_name', '_name')"
    });

};

