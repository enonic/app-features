import * as projectLib from '/lib/xp/project';
import * as contextLib from '/lib/xp/context';
import * as clusterLib from '/lib/xp/cluster';
import * as exportLib from '/lib/xp/export';
import type { ImportNodesResult, ImportNodesError } from '@enonic-types/lib-export';

const projectData = {
    id: 'features',
    displayName: 'Features',
    description: 'Testing features for Enonic XP',
    language: 'en',
    readAccess: {
        public: true
    }
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
        } else {
            log.error('Project "' + projectData.id + '" failed to be created');
        }
    }
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
