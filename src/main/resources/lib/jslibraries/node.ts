import * as nodeLib from '/lib/xp/node';
import * as repoLib from '/lib/xp/repo';

const testRepoId = "features-node-test-repo";

const initialize = function() {
    cleanUp();
    repoLib.create({
        id: testRepoId
    });
};

const connect = function() {
    return nodeLib.connect({
        repoId: testRepoId,
        branch: 'master'
    });
};

const cleanUp = function() {
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
    } as any);

    return result;
}

function modifyNode(key: any) {
    const repo = connect();

    const result = (repo as any).modify({
        key: key,
        editor: function(node: any) {
            node.someData.cars.push('peugeot');
            return node;
        }
    });

    return result;
}

function commitNode(key: any) {
    const repo = connect();

    const result = (repo as any).commit({
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
    const node = (connect() as any).exists('/my-name');
    cleanUp();

    return node;
}

export function existsMissing() {
    initialize();
    const node = (connect() as any).exists('/my-name');
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
    return (connect() as any).get('/node1', '/node2');
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
    return (repo as any).delete('/my-name', '/my-name2', 'missing');
}

export { deleteNodes as delete };

export function diff() {
    initialize();
    createNode('my-name');
    const repo = connect();
    return (repo as any).diff({
        key: '/my-name',
        target: 'draft'
    });
}

export function push() {
    initialize();
    createNode('my-name');

    repoLib.createBranch({
        repoId: testRepoId,
        branchId: 'anotherBranch'
    });

    const repo = connect();

    return (repo as any).push({
        key: '/my-name',
        target: 'anotherBranch'
    });
}

export function findChildren() {
    initialize();
    createNode('my-name');

    const repo = connect();
    repo.create({
        _name: "child1",
        _parentPath: "/my-name"
    } as any);
    repo.create({
        _name: "child2",
        _parentPath: "/my-name"
    } as any);

    (repo as any).refresh();

    return (repo as any).findChildren({
        parentKey: "/my-name"
    });
}
