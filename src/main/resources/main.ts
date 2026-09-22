import * as projectLib from '/lib/xp/project';
import * as contextLib from '/lib/xp/context';
import * as clusterLib from '/lib/xp/cluster';
import * as exportLib from '/lib/xp/export';
import * as contentLib from '/lib/xp/content';
import * as ioLib from '/lib/xp/io';
import type { ImportNodesResult, ImportNodesError } from '@enonic-types/lib-export';

const SAMPLES_PATH = '/samples';

const projectData = {
    id: 'features',
    displayName: 'Features',
    description: 'Testing features for Enonic XP',
    language: 'en',
    publicRead: true,
    // Assign this app to the project itself, not only to the site, so that content outside the
    // site can use its schemas and components.
    siteConfig: [
        {
            applicationKey: 'com.enonic.app.features',
            config: {}
        }
    ]
}

function runInContext(callback: () => unknown) {
    let result: unknown;
    try {
        result = contextLib.run({
            principals: ["role:system.admin"],
            repository: 'com.enonic.cms.' + projectData.id,
            branch: 'draft',
        }, callback);
    } catch (e: any) {
        log.info(`Error: ${e.message}`);
    }

    return result;
}

function createProject() {
    return projectLib.create(projectData);
}

function getProject() {
    return projectLib.get({
        id: projectData.id
    });
}


function initializeProject() {
    // Each step checks its own outcome rather than all of them hanging off project creation. A run
    // that fails halfway - a redeploy swapping the bundle under it, say - is then repaired by the
    // next start, instead of leaving a project that can only be fixed by deleting it.
    let project = runInContext(getProject);

    if (!project) {
        log.info('Project "' + projectData.id + '" not found. Creating...');
        project = runInContext(createProject);

        if (!project) {
            log.error('Project "' + projectData.id + '" failed to be created');
            return;
        }

        log.info('Project "' + projectData.id + '" successfully created');
    }

    const imported = runInContext(() => contentLib.exists({key: '/' + projectData.id}));

    if (imported) {
        log.info('Content for "' + projectData.id + '" is already present, skipping import');
        return;
    }

    log.info('Importing "' + projectData.id + '" data');
    runInContext(createContent);
    runInContext(createAttachmentsContent);
}

// Entry points for tests that run on a mapping rather than a page. They hold no data - they exist
// so the tests are reachable and visible in Content Studio - so they are created here rather than
// carried as node XML in the import. Creation is idempotent, which means a new entry point appears
// on the next deploy without the project having to be deleted.
const testEntryPoints = [
    {parentPath: '/', name: 'schedule-types', displayName: 'Schedule types'},
    {parentPath: '/', name: 'libraries', displayName: 'Library tests'},
    {parentPath: '/libraries', name: 'explicit-url', displayName: 'Explicit URL tests'},
    {parentPath: '/libraries', name: 'cluster', displayName: 'Lib Cluster'},
    {parentPath: '/libraries', name: 'content', displayName: 'Lib Content'},
    {parentPath: '/libraries', name: 'context', displayName: 'Lib Context'},
    {parentPath: '/libraries', name: 'i18n', displayName: 'Lib I18n'},
    {parentPath: '/libraries', name: 'node', displayName: 'Lib Node'},
    {parentPath: '/libraries', name: 'repo', displayName: 'Lib Repo'},
    {parentPath: '/libraries', name: 'value', displayName: 'Lib Value'},
    {parentPath: '/libraries', name: 'get-context', displayName: 'Lib Context, getContext'},
    {parentPath: '/libraries', name: 'markdown', displayName: 'Lib Markdown'},
    {parentPath: '/libraries', name: 'sql', displayName: 'Lib SQL'},
    {parentPath: '/libraries', name: 'xslt', displayName: 'Lib XSLT'},
    {parentPath: '/libraries', name: 'auditlog', displayName: 'Lib Auditlog'},
    {parentPath: '/libraries', name: 'auth', displayName: 'Lib Auth'},
    {parentPath: '/libraries', name: 'cache', displayName: 'Lib Cache'},
    {parentPath: '/libraries', name: 'http', displayName: 'Lib HTTP Client'},
    {parentPath: '/libraries', name: 'memberships', displayName: 'Lib Auth, memberships'},
    {parentPath: '/libraries', name: 'move-content', displayName: 'Lib Content, move'},
    {parentPath: '/libraries', name: 'notifications', displayName: 'Lib Notifications'},
    {parentPath: '/libraries', name: 'publish', displayName: 'Lib Content, publish'},
    {parentPath: '/libraries', name: 'qrcode', displayName: 'Lib QR Code'},
    {parentPath: '/libraries', name: 'sanitize', displayName: 'Lib IO, sanitize'},
    {parentPath: '/libraries', name: 'scheduler', displayName: 'Lib Scheduler'},
    {parentPath: '/libraries', name: 'unpublish', displayName: 'Lib Content, unpublish'},
    {parentPath: '/libraries', name: 'node-listing', displayName: 'NodeService list and enumerate'}
];

function createTestEntryPoints() {
    const created: string[] = [];

    testEntryPoints.forEach((entry) => {
        const path = (entry.parentPath === '/' ? '' : entry.parentPath) + '/' + entry.name;

        if (contentLib.exists({key: path})) {
            return;
        }

        contentLib.create({
            name: entry.name,
            parentPath: entry.parentPath,
            displayName: entry.displayName,
            contentType: 'base:folder',
            requireValid: true,
            data: {}
        });

        created.push(path);
    });

    if (created.length === 0) {
        log.info('Test entry points are all present');
        return;
    }

    log.info('Created ' + created.length + ' test entry point(s): ' + created.join(', '));

    // Publish what was just created, so the bulk publish below does not have to run again for it.
    const result = contentLib.publish({
        keys: created,
        includeDependencies: true,
        message: 'Test entry points'
    });

    log.info('Published ' + result.pushedContents.length + ' test entry point(s)');

    if (result.failedContents.length !== 0) {
        log.warning('Failed to publish ' + result.failedContents.length + ' test entry point(s)');
    }
}

// Plain sites and folders for explicit URL tests. No site applications or base URLs are assigned.
function createUnbasedUrlFixtures() {
    const fixtures = [
        {parentPath: '/', name: 'unbased', displayName: 'Unbased', contentType: 'portal:site'},
        {parentPath: '/unbased', name: 'subsite', displayName: 'Subsite', contentType: 'portal:site'},
        {parentPath: '/unbased', name: 'folder', displayName: 'Folder', contentType: 'base:folder'},
        {parentPath: '/unbased/subsite', name: 'folder', displayName: 'Folder', contentType: 'base:folder'}
    ];
    const paths = fixtures.map((fixture) => {
        const path = (fixture.parentPath === '/' ? '' : fixture.parentPath) + '/' + fixture.name;
        if (!contentLib.exists({key: path})) {
            contentLib.create({...fixture, requireValid: true, data: {}});
            log.info('Created explicit URL fixture ' + path);
        }
        return path;
    });

    // Make fixtures available on both branches, including after an interrupted initial publish.
    // Existing content and subsequent edits are left intact on redeployment.
    const unpublished = contextLib.run({branch: 'master'}, () =>
        paths.filter((path) => !contentLib.exists({key: path})));
    if (unpublished.length === 0) {
        return;
    }

    const ids = unpublished.map((path) => contentLib.get({key: path})!._id);
    const result = contentLib.publish({
        keys: ids,
        excludeDescendantsOf: ids,
        includeDependencies: false,
        message: 'Unbased sites for explicit URL tests'
    });
    log.info('Published ' + result.pushedContents.length + ' explicit URL fixture(s)');
    if (result.failedContents.length !== 0) {
        log.warning('Failed to publish explicit URL fixtures: ' + result.failedContents.join(', '));
    }
}

function publishContent() {
    log.info('Publishing ' + SAMPLES_PATH + ' content');

    const alreadyPublished = contextLib.run({
        repository: 'com.enonic.cms.' + projectData.id,
        branch: 'master',
        principals: ['role:system.admin']
    }, () => contentLib.exists({key: SAMPLES_PATH}));

    if (alreadyPublished) {
        log.info(SAMPLES_PATH + ' is already published, nothing to do');
        return;
    }

    const samples = contentLib.get({key: SAMPLES_PATH});

    if (!samples) {
        log.warning(SAMPLES_PATH + ' not found, nothing to publish');
        return;
    }

    // Only the samples are published. The rest of the imported content stays on draft, because
    // several tests publish content through the API and cannot observe the transition on content
    // that is already live.

    // `my-attachment-content` is created with requireValid: false and left IN_PROGRESS by
    // addAttachment. Publish refuses it on workflow state, and one refused item aborts the whole
    // call, so its id is kept out of the list. It stays unpublished on purpose, as a fixture for
    // testing publish against content that is not ready.
    const excluded = contentLib.get({key: SAMPLES_PATH + '/my-attachment-content'});

    // Descendants travel with their key, and `publish()` cannot exclude an individual id the way
    // the Publishing Wizard does. So the folder is published on its own, with
    // excludeDescendantsOf, and its wanted children are published separately.
    const childIds = contentLib.query({parent: samples._id, count: -1, returns: 'ids'})
        .hits
        .map((hit) => hit.id)
        .filter((id) => id !== excluded?._id);

    if (excluded) {
        log.info('Excluding ' + excluded._path + ' [' + excluded._id + '] workflow ' + excluded.workflow?.state);
    }

    const message = 'Initial publish of sample content';

    const folderResult = contentLib.publish({
        keys: [samples._id],
        excludeDescendantsOf: [samples._id],
        includeDependencies: true,
        message
    });

    const childResult = childIds.length !== 0
        ? contentLib.publish({
            keys: childIds,
            includeDependencies: true,
            message
        })
        : {pushedContents: [] as string[], failedContents: [] as string[]};

    const pushed = folderResult.pushedContents.concat(childResult.pushedContents);
    const failed = folderResult.failedContents.concat(childResult.failedContents);

    log.info('Published ' + pushed.length + ' content items');

    if (failed.length !== 0) {
        log.warning('Failed to publish ' + failed.length + ' content items:');
        failed.forEach((key: string) => {
            const item = contentLib.get({key});
            log.warning(item
                ? `${key} [${item._path}] valid=${item.valid} workflow=${item.workflow?.state}`
                : key);
        });
    }
}


function createAttachmentsContent() {
    const content = contentLib.create({
        name: 'my-attachment-content',
        parentPath: SAMPLES_PATH,
        displayName: 'My Attachment Content',
        contentType: app.name + ':attachments',
        requireValid: false,
        data: {
            attachment1: 'my-file.txt',
            attachment2: ['my-file2.txt', 'my-file3.txt']
        }
    });

    const attachments = [
        {name: 'my-file.txt', text: 'This is the first attachment.'},
        {name: 'my-file2.txt', text: 'This is the second attachment.'},
        {name: 'my-file3.txt', text: 'This is the third attachment.'}
    ];

    attachments.forEach(({name, text}) => {
        contentLib.addAttachment({
            key: content._id,
            name: name,
            mimeType: 'text/plain',
            data: ioLib.newStream(text)
        });
    });

    log.info('Attachment content created with id: ' + content._id);
}

function createContent() {
    const importNodes: ImportNodesResult = exportLib.importNodes({
        source: resolve('/import'),
        targetNodePath: '/content',
        xslt: resolve('/import/replace_app.xsl'),
        xsltParams: {
            applicationId: app.name
        },
        versionAttributes: {
            'content.import': {
                user: "role:system.admin",
                optime: new Date().toISOString()
            },
            'vacuum.skip': {}
        },
        includeNodeIds: true
    });
    log.info('-------------------');
    log.info('Imported nodes:');
    importNodes.addedNodes.forEach((element: string) => log.info(element));
    log.info('-------------------');
    log.info('Updated nodes:');
    importNodes.updatedNodes.forEach((element: string) => log.info(element));
    log.info('-------------------');
    log.info('Imported binaries:');
    importNodes.importedBinaries.forEach((element: string) => log.info(element));
    log.info('-------------------');
    if (importNodes.importErrors.length !== 0) {
        log.warning('Errors:');
        importNodes.importErrors.forEach((element: ImportNodesError) => log.warning(element.message));
        log.info('-------------------');
    }
}

function preloadCronLib() {
    contextLib.run({
        repository: 'system-repo',
        branch: 'master',
        principals: ["role:system.admin"]
    }, () => {
        require('/lib/cron');
    });
}

if (clusterLib.isMaster()) {
    initializeProject();
    runInContext(createTestEntryPoints);
    runInContext(createUnbasedUrlFixtures);
    runInContext(publishContent);
    preloadCronLib();
}
