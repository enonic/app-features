import * as libPortal from '/lib/xp/portal';
import * as libScheduler from '/lib/xp/scheduler';
import * as libThymeleaf from '/lib/thymeleaf';
import type {Request, RequestParams} from '@enonic-types/core';
import type {ScheduledJob} from '@enonic-types/lib-scheduler';

const view = resolve('scheduler.html');
const tableView = resolve('includes/schedulesTable.html');

function doExecute(params: RequestParams) {
    let result: ScheduledJob | boolean | null | undefined;
    if (params.operation === 'create') {
        result =
            createCronSchedule(params.schedulerName as string, params.schedulerDescription as string, params.schedulerDescriptor as string, params.schedulerSchedule as string);
        log.info('Create Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'delete') {
        result = deleteCronJobScheduler(params.schedulerName as string);
        log.info('Delete Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'modify') {
        result = modifyCronJobSchedule(params.schedulerName as string, params.schedulerDescription as string, params.schedulerDescriptor as string, true,
            params.schedulerSchedule as string);
        log.info('Modify Schedule result: %s', JSON.stringify(result));
    } else if (params.operation === 'get') {
        result = getSchedule(params.name as string);
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

function createCronSchedule(name: string, description: string, descriptor: string, schedule: string) {
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
    });
}

function getSchedule(name: string) {
    const job = libScheduler.get({name: name});

    if (job) {
        log.info('Job is found: ' + JSON.stringify(job));
    } else {
        log.info('Job not found');
    }

    return job;
}

function modifyCronJobSchedule(name: string, description: string, descriptor: string, enabled: boolean, schedule: string) {
    return libScheduler.modify({
        name: name,
        editor: (edit: ScheduledJob) => {
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

function deleteCronJobScheduler(name: string) {
    return libScheduler.delete({
        name: name
    });
}

export const GET = function (req: Request) {
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

export const POST = function (req: Request) {
    return doExecute(req.params);
};
