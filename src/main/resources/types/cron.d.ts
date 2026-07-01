declare module '/lib/cron' {
    interface ScheduleContextUser {
        login: string;
        idProvider?: string;
        userStore?: string;
    }

    interface ScheduleContext {
        repository?: string;
        branch?: string;
        principals?: string[];
        attributes?: Record<string, unknown>;
        user?: ScheduleContextUser;
    }

    interface ScheduleParams {
        name: string;
        callback: () => void;
        cron?: string;
        fixedDelay?: number;
        delay?: number;
        times?: number;
        context?: ScheduleContext;
    }

    interface UnscheduleParams {
        name: string;
    }

    interface GetParams {
        name: string;
    }

    interface ListParams {
        pattern?: string;
    }

    interface JobDescriptor {
        name: string;
        cron?: string;
        cronDescription?: string;
        fixedDelay?: number;
        delay?: number;
        applicationKey: string;
        context: {
            repository?: string;
            branch?: string;
            authInfo?: unknown;
        };
        nextExecTime?: string;
    }

    interface JobList {
        jobs: JobDescriptor[];
    }

    export function schedule(params: ScheduleParams): unknown;
    export function reschedule(params: ScheduleParams): unknown;
    export function unschedule(params: UnscheduleParams): unknown;
    export function get(params: GetParams): JobDescriptor | null;
    export function list(params?: ListParams): JobList;
}

export {};
