var contextLib = require('/lib/xp/context');
var repoLib = require('/lib/xp/repo');
var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');

var DEFAULT_REPO_ID = "test-repo";

var doCreateNode = function (params) {

    var data = {
        myGeoPoint: nodeLib.geoPoint(params.myGeoPoint),
        myInstant: nodeLib.instant(params.myInstant),
        myLocalDateTime: nodeLib.localDateTime(params.myLocalDateTime)
    };

    var stream = portalLib.getMultipartStream('myFile');

    if (stream) {
        var item = portalLib.getMultipartItem("myFile");
        data.myFile = nodeLib.binary(item.fileName, stream);
    }

    return nodeLib.create(data);
};


var handlePost = function (req) {

    var params = req.params;
    var repoId = verifyRepo(params);

    var createdNode;

    contextLib.run({
        branch: 'master',
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"],
        repository: repoId
    }, function () {
        createdNode = doCreateNode(params);
    });

    log.info("Created node: %s", JSON.stringify(createdNode));

    return {
        contentType: 'application/json',
        body: createdNode
    };
};

var verifyRepo = function (params) {

    var repoId = "";

    if (!params.repoId) {
        repoId = DEFAULT_REPO_ID;
    } else {
        repoId = params.repoId;
    }

    var existingRepo = repoLib.get({
        id: repoId
    });

    if (!existingRepo) {
        log.info("Creating repository: [" + repoId + "]");

        repoLib.create({
            id: repoId,
            settings: {
                validationSettings: {
                    checkExists: false,
                    checkParentExists: false
                }
            }
        });

        repoLib.refresh();

        log.info("Created repository: [" + repoId + "]");

    } else {
        log.info("Repository [" + repoId + "] exists");
    }

    return repoId;
};


exports.post = handlePost;


