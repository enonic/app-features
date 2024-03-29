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
    var repo = repoLib.get(testRepoId);

    if (repo) {
        repoLib.delete(testRepoId);
    }
};

function createNode(name, params) {
    var repo = connect();

    var result = repo.create({
        _name: name,
        _parentPath: params && params.parentPath,
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

function modifyNode(key) {
    var repo = connect();

    var result = repo.modify({
        key: key,
        editor: function (node) {
            node.someData.cars.push('peugeot');
            return node;
        }
    });

    return result;
}

function commitNode(key) {
    var repo = connect();

    var result = repo.commit({
        keys: key,
        message: 'Commit message'
    });

    return result;
}

exports.create = function () {
    initialize();
    var node = createNode('my-node');
    cleanUp();
    return node;
};

exports.modify = function () {
    initialize();
    var node = createNode('my-node');
    var numberClassBefore = node.someData.numberOfUselessGadgets.getClass();
    node = modifyNode(node._id);
    var numberClassAfter = node.someData.numberOfUselessGadgets.getClass();
    if (numberClassBefore !== numberClassAfter) {
        throw 'Number class was ' + numberClassBefore + ' and is now ' + numberClassAfter;
    }
    cleanUp();
    return node;
};

exports.commit = function () {
    initialize();
    createNode('my-node');
    var commit = commitNode('my-node');
    cleanUp();
    return commit;
};

exports.getNodeByKey = function () {
    initialize();
    createNode('my-name');
    var node = connect().get('/my-name');
    cleanUp();

    return node;
};

exports.exists = function () {
    initialize();
    createNode('my-name');
    var node = connect().exists('/my-name');
    cleanUp();

    return node;
};

exports.existsMissing = function () {
    initialize();
    var node = connect().exists('/my-name');
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
    createNode('my-name2');
    var repo = connect();
    return repo.delete('/my-name', '/my-name2', 'missing');
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

exports.setChildOrder = function () {
    initialize();
    createNode('my-name');

    var repo = connect();
    return repo.setChildOrder({
        key: '/my-name',
        childOrder: 'field DESC'
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

exports.suggestions = function () {
    initialize();
    createNode("name");
    createNode("named");
    createNode("named", {parentPath: "/named"});

    var repo = connect();
    repo.refresh();

    return repo.query({
        suggestions: {
            "my-exact-suggestion": {
                "text": "name",
                "term": {
                    "field": "_name"
                }
            },
            "my-min-suggestion": {
                "text": "namf",
                "term": {
                    "field": "_name"
                }
            },
            "my-byfrequency-suggestion": {
                "text": "namf",
                "term": {
                    "field": "_name",
                    "size": 1,
                    "sort": "frequency",
                }
            },
            "my-popular-suggestion": {
                "text": "name",
                "term": {
                    "field": "_name",
                    "suggestMode": "popular"
                }
            },
            "my-maxedits-suggestion": {
                "text": "namf",
                "term": {
                    "field": "_name",
                    "maxEdits": 1
                }
            }
        }
    });

};

exports.highlight = function () {
    initialize();
    createNode("name");

    var repo = connect();
    repo.refresh();

    return repo.query({
        query: "ngram('displayName', 'bran', 'AND')",
        highlight: {
            properties: {
                "displayName": {
                    preTag: "<before>",
                    postTag: "<after>"
                }
            }
        }
    });
};

exports.findVersions = function () {
    initialize();
    var node = createNode("my-name");
    node = modifyNode(node._id);

    var repo = connect();
    repo.refresh();

    return repo.findVersions({
        key: node._id
    });
};

exports.getByVersionIds = function () {
    initialize();
    var node = createNode("my-name");
    node = modifyNode(node._id);

    var repo = connect();
    repo.refresh();

    var versions = repo.findVersions({
        key: node._id
    });

    var params = versions.hits.map(hit => {
        return {
            key: node._id,
            versionId: hit.versionId
        };
    });
    return repo.get(params);
};

exports.setActiveVersion = function () {
    initialize();
    var node = createNode("my-name");
    node = modifyNode(node._id);

    var repo = connect();
    repo.refresh();

    var findVersions = repo.findVersions({
        key: node._id
    });

    return {
        findVersions: findVersions,
        getActiveVersionBefore: repo.getActiveVersion({
            key: node._id
        }),
        setActiveVersion: repo.setActiveVersion({
            key: node._id,
            versionId: findVersions.hits[1].versionId
        }),
        getActiveVersionAfter: repo.getActiveVersion({
            key: node._id
        })
    };
};

exports.getCommit = function () {
    initialize();
    var node = createNode("my-name");
    node = modifyNode(node._id);

    var repo = connect();
    repo.refresh();

    var commit = commitNode(node._id);

    return repo.getCommit({
        id: commit.id
    });
};

