import * as projectLib from '/lib/xp/project';
import * as contextLib from '/lib/xp/context';
import * as clusterLib from '/lib/xp/cluster';
import * as exportLib from '/lib/xp/export';
import * as contentLib from '/lib/xp/content';
import * as ioLib from '/lib/xp/io';
import type { ImportNodesResult, ImportNodesError } from '@enonic-types/lib-export';

const projectData = {
    id: 'features',
    displayName: 'Features',
    description: 'Testing features for Enonic XP',
    language: 'en',
    publicRead: true
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
    let project = runInContext(getProject);

    if (!project) {
        log.info('Project "' + projectData.id + '" not found. Creating...');
        project = runInContext(createProject);

        if (project) {
            log.info('Project "' + projectData.id + '" successfully created');

            log.info('Importing "' + projectData.id + '" data');
            runInContext(createContent);
            runInContext(createAttachmentsContent);
        } else {
            log.error('Project "' + projectData.id + '" failed to be created');
        }
    }
}

function publishContent() {
    log.info('Publishing "' + projectData.id + '" content');

    const sitePath = '/' + projectData.id;

    const alreadyPublished = contextLib.run({
        repository: 'com.enonic.cms.' + projectData.id,
        branch: 'master',
        principals: ['role:system.admin']
    }, () => contentLib.exists({key: sitePath}));

    if (alreadyPublished) {
        log.info('Site ' + sitePath + ' is already published, nothing to do');
        return;
    }

    const site = contentLib.get({key: sitePath});

    if (!site) {
        log.error('Site ' + sitePath + ' not found, nothing published');
        return;
    }

    // `my-attachment-content` is created with requireValid: false and left IN_PROGRESS by
    // addAttachment. Publish refuses it on workflow state, and one refused item aborts the whole
    // call, so its id is kept out of the list. It stays unpublished on purpose, as a fixture for
    // testing publish against content that is not ready.
    const excluded = contentLib.get({key: sitePath + '/my-attachment-content'});

    // Descendants travel with their key, so publishing the site would drag the excluded content in
    // with it. excludeDescendantsOf takes content ids, not paths, and drops the descendants of the
    // ids it names: the site node publishes alone, then each child with its own subtree.
    const children = contentLib.query({
        parent: site._id,
        count: -1,
        returns: 'ids'
    });

    const childIds = children.hits
        .map((hit) => hit.id)
        .filter((id) => id !== excluded?._id);

    if (excluded) {
        log.info('Excluding ' + excluded._path + ' [' + excluded._id + '] workflow ' + excluded.workflow?.state);
    }

    const message = 'Initial publish of imported content';

    const siteResult = contentLib.publish({
        keys: [site._id],
        excludeDescendantsOf: [site._id],
        includeDependencies: true,
        message
    });

    const childResult = contentLib.publish({
        keys: childIds,
        includeDependencies: true,
        message
    });

    const pushed = siteResult.pushedContents.concat(childResult.pushedContents);
    const failed = siteResult.failedContents.concat(childResult.failedContents);

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
        parentPath: '/features',
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
    runInContext(publishContent);
    preloadCronLib();
}
