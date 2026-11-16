var t = require('/lib/xp/testing');
var draft;
var master;
var branch;
var moves;
var publications;
var nextId;
var oldPath = '/libraries/explicit-url';
var newPath = '/libraries/portal/pageUrlParts';

t.mock('/lib/xp/project.js', {});
t.mock('/lib/xp/export.js', {});
t.mock('/lib/xp/io.js', {});
t.mock('/lib/xp/cluster.js', {isMaster: function () { return false; }});
t.mock('/lib/xp/context.js', {
    run: function (context, fn) {
        var previous = branch;
        branch = context.branch;
        try { return fn(); } finally { branch = previous; }
    }
});
t.mock('/lib/xp/content.js', {
    exists: function (params) { return !!(branch === 'master' ? master : draft)[params.key]; },
    create: function (params) {
        var path = (params.parentPath === '/' ? '' : params.parentPath) + '/' + params.name;
        draft[path] = {_id: 'id-' + nextId++, _path: path, displayName: params.displayName, workflow: {state: 'READY'}};
        return draft[path];
    },
    move: function (params) {
        moves++;
        var content = draft[params.source];
        delete draft[params.source];
        content._path = params.target;
        draft[params.target] = content;
        return content;
    },
    update: function (params) {
        var path = Object.keys(draft).filter(function (key) { return draft[key]._id === params.key; })[0];
        draft[path] = params.editor(draft[path]);
        // XP resets workflow when content is updated.
        draft[path].workflow = {state: 'IN_PROGRESS'};
        return draft[path];
    },
    updateWorkflow: function (params) {
        draft[params.key].workflow = params.editor(draft[params.key].workflow);
        return {content: draft[params.key]};
    },
    publish: function (params) {
        publications++;
        params.keys.forEach(function (path) {
            t.assertEquals('READY', draft[path].workflow.state);
            Object.keys(master).forEach(function (old) {
                if (master[old]._id === draft[path]._id) { delete master[old]; }
            });
            master[path] = JSON.parse(JSON.stringify(draft[path]));
        });
        return {pushedContents: params.keys, failedContents: [], failed: []};
    }
});

var initialize = require('/main').createTestEntryPoints;

function reset() {
    draft = {};
    master = {};
    branch = 'draft';
    moves = 0;
    publications = 0;
    nextId = 1;
}

exports.testMovesAndPublishesExistingPageOnlyOnce = function () {
    reset();
    draft[oldPath] = {_id: 'original', _path: oldPath, displayName: 'Explicit URL tests', workflow: {state: 'READY'}};
    master[oldPath] = JSON.parse(JSON.stringify(draft[oldPath]));
    initialize();
    t.assertEquals('original', master[newPath]._id);
    t.assertEquals('pageUrlParts', master[newPath].displayName);
    t.assertEquals('Lib Portal', master['/libraries/portal'].displayName);
    t.assertEquals(false, !!master[oldPath]);
    t.assertEquals(false, !!draft[oldPath]);
    initialize();
    t.assertEquals(1, moves);
    t.assertEquals(1, publications);
};

exports.testFinishesPublishingAfterAnInterruptedMove = function () {
    reset();
    draft[newPath] = {_id: 'original', _path: newPath, displayName: 'pageUrlParts', workflow: {state: 'IN_PROGRESS'}};
    master[oldPath] = {_id: 'original', _path: oldPath};
    initialize();
    t.assertEquals('original', master[newPath]._id);
    t.assertEquals('READY', master[newPath].workflow.state);
    t.assertEquals(0, moves);
    t.assertEquals(false, !!master[oldPath]);
};

exports.testCreatesTheHierarchyOnAFreshProject = function () {
    reset();
    initialize();
    t.assertEquals('Lib Portal', master['/libraries/portal'].displayName);
    t.assertEquals('pageUrlParts', master[newPath].displayName);
    t.assertEquals(false, !!draft[oldPath]);
    t.assertEquals(0, moves);
};
