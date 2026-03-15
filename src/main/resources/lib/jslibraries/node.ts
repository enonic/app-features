import * as nodeLib from '/lib/xp/node';
import * as repoLib from '/lib/xp/repo';

const testRepoId = "features-node-test-repo";

const initialize = function () {
    cleanUp();
    repoLib.create({
        id: testRepoId
    });
};

const connect = function () {
    return nodeLib.connect({
        repoId: testRepoId,
        branch: 'master'
    });
};

const cleanUp = function () {
    const repo = repoLib.get(testRepoId);

    if (repo) {
        repoLib.delete(testRepoId);
    }
};

function createNode(name: any, params?: any) {
    const repo = connect();

    const result = repo.create({
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
            configs: [{
                path: "displayName",
                config: "fulltext"
            }]
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

function modifyNode(key: any) {
    const repo = connect();

    return repo.update({
        key: key,
        editor: function (node: any) {
            node.someData.cars.push('peugeot');
            return node;
        }
    });
}

function commitNode(key: any) {
    const repo = connect();

    const result = repo.commit({
        keys: key,
        message: 'Commit message'
    });

    return result;
}

export function create() {
    initialize();
    const node = createNode('my-node');
    cleanUp();
    return node;
}

export function modify() {
    initialize();
    let node: any = createNode('my-node');
    const numberClassBefore = (node.someData.numberOfUselessGadgets as any).getClass();
    node = modifyNode(node._id);
    const numberClassAfter = (node.someData.numberOfUselessGadgets as any).getClass();
    if (numberClassBefore !== numberClassAfter) {
        throw 'Number class was ' + numberClassBefore + ' and is now ' + numberClassAfter;
    }
    cleanUp();
    return node;
}

export function commit() {
    initialize();
    createNode('my-node');
    const c = commitNode('my-node');
    cleanUp();
    return c;
}

export function getNodeByKey() {
    initialize();
    createNode('my-name');
    const node = connect().get('/my-name');
    cleanUp();

    return node;
}

export function exists() {
    initialize();
    createNode('my-name');
    const node = connect().exists('/my-name');
    cleanUp();

    return node;
}

export function existsMissing() {
    initialize();
    const node = connect().exists('/my-name');
    cleanUp();

    return node;
}

export function getMissingNodeByKey() {
    initialize();
    return connect().get('missing');
}

export function getNodesByKeys() {
    initialize();
    createNode('node1');
    createNode('node2');
    return connect().get('/node1', '/node2');
}

export function rename() {
    initialize();
    createNode('my-name');
    const repo = connect();
    return repo.move({
        source: '/my-name',
        target: 'new-name'
    });
}

export function move() {
    initialize();
    createNode('my-name');
    createNode('parent');

    const repo = connect();
    return repo.move({
        source: '/my-name',
        target: '/parent/'
    });
}

export function moveAndRename() {
    initialize();
    createNode('my-name');
    createNode('new-parent');

    const repo = connect();
    return repo.move({
        source: '/my-name',
        target: '/new-parent/newer-name'
    });
}

export function deleteNodes() {
    initialize();
    createNode('my-name');
    createNode('my-name2');
    const repo = connect();
    return repo.delete('/my-name', '/my-name2', 'missing');
}

export function diff() {
    initialize();
    createNode('my-name');
    const repo = connect();
    return repo.diff({
        key: '/my-name',
        target: 'draft',
        includeChildren: true
    });
}

export function push() {
    initialize();
    createNode('my-name');

    repoLib.createBranch({
        repoId: testRepoId,
        branchId: 'another-branch'
    });

    const repo = connect();

    return repo.push({
        key: '/my-name',
        target: 'another-branch'
    });
}

export function findChildren() {
    initialize();
    createNode('my-name');

    const repo = connect();
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
}

export function sort() {
    initialize();
    createNode('my-name');

    const repo = connect();
    repo.create({
        _name: "child1",
        _parentPath: "/my-name"
    });
    repo.create({
        _name: "child2",
        _parentPath: "/my-name"
    });

    repo.refresh();

    return repo.sort({
        key: "/my-name",
        childOrder: "_name DESC"
    });
}

export function query() {
    initialize();
    createNode('my-name');

    const repo = connect();
    repo.refresh();

    return repo.query({
        start: 0,
        count: 10,
        query: "displayName = 'This is brand new node'"
    });
}

export function suggestions() {
    initialize();
    createNode('my-name');

    const repo = connect();
    repo.refresh();

    return repo.query({
        start: 0,
        count: 0,
        query: '',
        suggestions: {
            mySuggestion: {
                text: 'this is brand',
                term: {
                    field: 'displayName',
                    sort: 'frequency',
                    suggestMode: 'always'
                }
            }
        }
    } as any);
}

export function highlight() {
    initialize();
    createNode('my-name');

    const repo = connect();
    repo.refresh();

    return repo.query({
        start: 0,
        count: 10,
        query: "fulltext('displayName', 'brand')",
        highlight: {
            properties: {
                displayName: {}
            }
        }
    });
}

export function findVersions() {
    initialize();
    const node = createNode('my-name');
    modifyNode(node._id);

    const repo = connect();

    return repo.getVersions({
        key: '/my-name'
    });
}

export function getActiveVersion() {
    initialize();
    createNode('my-name');

    const repo = connect();

    return repo.getActiveVersion({
        key: '/my-name'
    });
}

export function getCommit() {
    initialize();
    createNode('my-name');
    const c = commitNode('my-name');

    const repo = connect();

    return repo.getCommit({
        id: c.id
    });
}
