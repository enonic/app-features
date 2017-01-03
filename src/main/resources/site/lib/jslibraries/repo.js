var contextLib = require('/lib/xp/context.js');
var nodeLib = require('/lib/xp/node.js');
var repoLib = require('/lib/xp/repo.js');

exports.create = function (id) {

    var repo = repoLib.get(id);

    if (repo) {
        log.info('Repository [' + id + '] already exists');
        return 'Repository [' + id + '] already exists';
    } else {
        var result = repoLib.create({
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
            settings: {
                definitions: {
                    version: {
                        settings: {
                            "index": {
                                "number_of_shards": 1,
                                "number_of_replicas": 1
                            },
                            "analysis": {
                                "analyzer": {
                                    "keywordlowercase": {
                                        "type": "custom",
                                        "tokenizer": "keyword",
                                        "filter": [
                                            "lowercase"
                                        ]
                                    }
                                }
                            }
                        },
                        mapping: {
                            "version": {
                                "_all": {
                                    "enabled": false
                                },
                                "_source": {
                                    "enabled": true
                                },
                                "date_detection": false,
                                "numeric_detection": false,
                                "properties": {
                                    "nodeid": {
                                        "type": "string",
                                        "store": "true",
                                        "index": "not_analyzed"
                                    },
                                    "versionid": {
                                        "type": "string",
                                        "store": "true",
                                        "index": "not_analyzed"
                                    },
                                    "timestamp": {
                                        "type": "date",
                                        "store": "true",
                                        "index": "not_analyzed"
                                    },
                                    "nodepath": {
                                        "type": "string",
                                        "store": "true",
                                        "index": "analyzed",
                                        "analyzer": "keywordlowercase"
                                    }
                                }
                            }
                        }
                    },
                    branch: {
                        settings: {
                            "index": {
                                "number_of_shards": 1,
                                "number_of_replicas": 1
                            },
                            "analysis": {
                                "analyzer": {
                                    "keywordlowercase": {
                                        "type": "custom",
                                        "tokenizer": "keyword",
                                        "filter": [
                                            "lowercase"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        log.info('Repository [' + result.id + '] was created');
        return result;
    }
};

exports.getRootNode = function (repositoryId) {
    var repo = nodeLib.connect({
        repoId: repositoryId,
        branch: 'master'
    });

    return repo.get('/');
};

exports.list = function () {
    return repoLib.list();
};

exports.get = function (id) {
    return repoLib.get(id);
};

exports.delete = function (id) {
    return repoLib.delete(id);
};

exports.createBranch = function (repositoryId, branchId) {
    return repoLib.createBranch({
        repoId: repositoryId,
        branchId: branchId
    });
};