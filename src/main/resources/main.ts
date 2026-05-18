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

if (clusterLib.isMaster()) {
    initializeProject();
}
