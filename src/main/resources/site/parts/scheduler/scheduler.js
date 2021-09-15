let libPortal = require('/lib/xp/portal');
let libScheduler = require('/lib/xp/scheduler');
let view = resolve('scheduler.html');
let createFormView = resolve('includes/createForm.html');
let deleteFormView = resolve('includes/deleteForm.html');

let libThymeleaf = require('/lib/thymeleaf');

function doExecute(params) {
    log.info('In doExecute for scheduler.js.  Parameters: %s', JSON.stringify(params));
    let result, body;
    if (params.operation === 'create') {
        result = createCronSchedule(params.schedulerName, params.schedulerDescription, params.schedulerDescriptor, params.schedulerSchedule);
        log.info('Create Schedule result: %s', JSON.stringify(result));
        body = libThymeleaf.render(createFormView, {postUrl: libPortal.componentUrl({})});
    } else if (params.operation === 'delete') {
        result = deleteCronJobScheduler(params.schedulerName);
        log.info('Delete Schedule result: %s', JSON.stringify(result));
        body = libThymeleaf.render(deleteFormView, {postUrl: libPortal.componentUrl({})});
    } else if (params.operation === 'modify') {
        result = modifyCronJobSchedule(params.schedulerName, params.schedulerDescription, params.schedulerDescriptor, true, params.schedulerSchedule);
        log.info('Modify Schedule result: %s', JSON.stringify(result));
        body = libThymeleaf.render(view, libScheduler.list());
    } else {
        body = libThymeleaf.render(view, libScheduler.list());
    }

    return {
        contentType: 'text/html',
        body: body
    };
}

function createCronSchedule(name, description, descriptor, schedule) {
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

function getSchedule(name) {
    let job = libScheduler.get(name);

    // if (job) {
    //     log.info('Job is found: ' + JSON.stringify(job));
    // } else {
    //     log.info('Job not found');
    // }

    return job;
}

function modifyCronJobSchedule(name, description, descriptor, enabled, schedule) {
    return libScheduler.modify({
        name: name,
        editor: (edit) => {
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

function deleteCronJobScheduler(name) {
    return libScheduler.delete({
        name: name
    })
}

exports.get = function (req) {
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

exports.post = function (req) {
    return doExecute(req.params);
};
