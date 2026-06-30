import * as thymeleaf from '/lib/thymeleaf';
import * as sql from '/lib/sql';
import type {Request} from '@enonic-types/core';
import type {Handle} from '/lib/sql';

const JDBC_URL = 'jdbc:h2:mem:lib-sql-demo;DB_CLOSE_DELAY=-1';
const JDBC_DRIVER = 'org.h2.Driver';

const SEED_SQL: string[] = [
    "CREATE TABLE IF NOT EXISTS person (id INT PRIMARY KEY, name VARCHAR(64), city VARCHAR(64))",
    "MERGE INTO person (id, name, city) KEY(id) VALUES (1, 'Ada Lovelace', 'London')",
    "MERGE INTO person (id, name, city) KEY(id) VALUES (2, 'Grace Hopper', 'New York')",
    "MERGE INTO person (id, name, city) KEY(id) VALUES (3, 'Alan Turing', 'Manchester')"
];

const QUERY_SQL = 'SELECT id, name, city FROM person ORDER BY id';

let cachedHandle: Handle | null = null;

function getHandle(): Handle {
    if (cachedHandle) {
        return cachedHandle;
    }
    const handle = sql.connect({
        url: JDBC_URL,
        driver: JDBC_DRIVER,
        user: 'sa',
        password: '',
        maxPoolSize: 4,
        minPoolSize: 0
    });
    for (let i = 0; i < SEED_SQL.length; i++) {
        handle.execute(SEED_SQL[i]);
    }
    cachedHandle = handle;
    return handle;
}

export const GET = function (req: Request) {
    let rows: Record<string, unknown>[] | null = null;
    let rowCount: number | null = null;
    let errorMsg: string | null = null;
    let infoMsg: string | null = null;

    try {
        const handle = getHandle();
        const result = handle.query(QUERY_SQL);
        rows = result.result;
        rowCount = result.count;
        infoMsg = 'Connected to ' + JDBC_URL + ' and ran: ' + QUERY_SQL;
    } catch (e: any) {
        errorMsg = 'SQL demo failed: ' + (e && e.message ? e.message : String(e));
    }

    const params = {
        jdbcUrl: JDBC_URL,
        jdbcDriver: JDBC_DRIVER,
        seedSql: SEED_SQL,
        querySql: QUERY_SQL,
        rows: rows,
        rowCount: rowCount,
        errorMsg: errorMsg,
        infoMsg: infoMsg
    };

    const view = resolve('sql.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
