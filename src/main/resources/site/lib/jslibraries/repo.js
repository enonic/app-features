var repoLib = require('/lib/xp/repo.js');

exports.create = function (id) {

    var repo = repoLib.get({
        id: id
    });

    if (repo) {
        log.info('Repository [' + id + '] already exists');
        return 'Repository [' + id + '] already exists';
    } else {
        var result = repoLib.create({
            id: id,
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

exports.list = function () {
    var result = repoLib.list();

    return result;
};

exports.get = function (id) {
    var result = repoLib.get({
        id: id
    });

    return result;
};

exports.createBranch = function (id) {
    var result = repoLib.createBranch({
        id: id
    });

    return result;
};