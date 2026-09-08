import * as taskLib from '/lib/xp/task';
import {runOperation, suites} from '/lib/library-suites';

interface LibraryProbeConfig {
    suite: string;
}

export function run(config: LibraryProbeConfig): void {
    const suite = suites[config.suite];

    if (!suite) {
        taskLib.progress({info: 'Unknown suite: ' + config.suite});
        log.warning('library-probe: unknown suite %s', config.suite);
        return;
    }

    const total = suite.operations.length;
    let failed = 0;

    taskLib.progress({info: 'Starting ' + suite.label, current: 0, total});

    for (let i = 0; i < total; i++) {
        const result = runOperation(suite.operations[i]);

        if (!result.ok) {
            failed = failed + 1;
            log.warning('library-probe: %s failed: %s', result.label, result.output);
        }

        taskLib.progress({
            info: result.label + ': ' + result.verdict,
            current: i + 1,
            total
        });
    }

    taskLib.progress({
        info: failed === 0
            ? 'All ' + total + ' operations succeeded'
            : failed + ' of ' + total + ' operations failed',
        current: total,
        total
    });
}
