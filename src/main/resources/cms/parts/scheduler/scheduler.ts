import * as libPortal from '/lib/xp/portal';
import * as libScheduler from '/lib/xp/scheduler';
const libThymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('scheduler.html');
const tableView = resolve('includes/schedulesTable.html');

function doExecute(params: any) {
    let result: any, body: any;
    if (params.operation === 'create') {
        result =
            createCronSchedule(params.schedulerName, params.schedulerDescription, params.schedulerDescriptor, params.schedulerSchedule);
        log.info('Create Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'delete') {
        result = deleteCronJobScheduler(params.schedulerName);
        log.info('Delete Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'modify') {
        result = modifyCronJobSchedule(params.schedulerName, params.schedulerDescription, params.schedulerDescriptor, true,
            params.schedulerSchedule);
        log.info('Modify Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'get') {
        result = getSchedule(params.name);
        log.info('Get Schedule result: %s', JSON.stringify(result));
    }

    if (params.operation === 'get') {
        return {
            contentType: 'application/json',
            body: JSON.stringify(result)
        };
    } else {
        return {
            contentType: 'text/html',
            body: libThymeleaf.render(tableView, {schedules: libScheduler.list()})
        };
    }
}

function createCronSchedule(name: any, description: any, descriptor: any, schedule: any) {
    return libScheduler.create({
        name: name,
        description: description,
        descriptor: descriptor,
        schedule: {
            value: schedule,
            type: 'CRON',
            timeZone: 'GMT-01:00'
        },
        enabled: true
    } as any);
}

function getSchedule(name: any) {
    const job = libScheduler.get({name: name});

    if (job) {
        log.info('Job is found: ' + JSON.stringify(job));
    } else {
        log.info('Job not found');
    }

    return job;
}

function modifyCronJobSchedule(name: any, description: any, descriptor: any, enabled: any, schedule: any) {
    return libScheduler.modify({
        name: name,
        editor: (edit: any) => {
            edit.descriptor = descriptor;
            edit.description = description;
            edit.enabled = enabled;
            edit.schedule = {
                type: 'CRON',
                value: schedule,
                timeZone: 'GMT-03:00'
            };
            return edit;
        }
    });
}

function deleteCronJobScheduler(name: any) {
    return libScheduler.delete({
        name: name
    });
}

export const GET = function(req: any) {
    return {
        contentType: 'text/html',
        body: libThymeleaf.render(view, {
            schedules: libScheduler.list(),
            postUrl: libPortal.componentUrl({})
        }),
        pageContributions: {
            bodyEnd: [
                '<script src="' + libPortal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + libPortal.assetUrl({path: 'js/parts/scheduler/scheduler.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

export const POST = function(req: any) {
    return doExecute(req.params);
};
