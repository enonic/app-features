import * as nodeLib from '/lib/xp/node';
import * as repoLib from '/lib/xp/repo';

export function create(id: any) {
    const repo = repoLib.get(id);

    if (repo) {
        log.info('Repository [' + id + '] already exists');
        return 'Repository [' + id + '] already exists';
    } else {
        const result = repoLib.create({
            id: id,
            rootPermissions: [
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
            ],
            rootChildOrder: "_timestamp ASC",
        });

        log.info('Repository [' + result.id + '] was created');
        return result;
    }
}

export function getRootNode(repositoryId: any) {
    const repo = nodeLib.connect({
        repoId: repositoryId,
        branch: 'master'
    });

    return repo.get('/');
}

export function list() {
    return repoLib.list();
}

export function get(id: any) {
    return repoLib.get(id);
}

export function deleteRepo(id: any) {
    return repoLib.delete(id);
}

export function createBranch(repositoryId: any, branchId: any) {
    return repoLib.createBranch({
        repoId: repositoryId,
        branchId: branchId
    });
}
