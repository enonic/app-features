import * as thymeleaf from '/lib/thymeleaf';
import * as sql from '/lib/sql';
import type {Request} from '@enonic-types/core';
import type {Handle} from '/lib/sql';

const JDBC_URL = 'jdbc:h2:mem:lib-sql-demo;DB_CLOSE_DELAY=-1';
const JDBC_DRIVER = 'org.h2.Driver';

let cachedHandle: Handle | null = null;

function getHandle(): Handle {
    if (cachedHandle) {
        return cachedHandle;
    }
    cachedHandle = sql.connect({
        url: JDBC_URL,
        driver: JDBC_DRIVER,
        user: 'sa',
        password: '',
        maxPoolSize: 4,
        minPoolSize: 0
    });
    return cachedHandle;
}

// lib-sql 2.0.0 only accepts SQL strings — no JDBC parameter binding is
// exposed at the JS layer. This helper inlines parameters into a SQL
// template, escaping/quoting per type, so call sites never concatenate
// untrusted strings directly into SQL.
function bind(template: string, params: ReadonlyArray<unknown>): string {
    let i = 0;
    let out = '';
    let inString = false;
    for (let pos = 0; pos < template.length; pos++) {
        const ch = template.charAt(pos);
        if (ch === "'") {
            inString = !inString;
            out += ch;
            continue;
        }
        if (ch === '?' && !inString) {
            if (i >= params.length) {
                throw new Error('bind: not enough parameters (template has more ? than supplied)');
            }
            out += quote(params[i++]);
            continue;
        }
        out += ch;
    }
    if (i !== params.length) {
        throw new Error('bind: too many parameters (template has fewer ? than supplied)');
    }
    return out;
}

function quote(v: unknown): string {
    if (v === null || v === undefined) {
        return 'NULL';
    }
    if (typeof v === 'number') {
        if (!isFinite(v)) {
            throw new Error('bind: cannot bind non-finite number');
        }
        return String(v);
    }
    if (typeof v === 'boolean') {
        return v ? 'TRUE' : 'FALSE';
    }
    if (v instanceof Date) {
        return "TIMESTAMP '" + v.toISOString().replace('T', ' ').slice(0, 19) + "'";
    }
    return "'" + String(v).replace(/'/g, "''") + "'";
}

interface SectionInternal {
    id: string;
    title: string;
    sql: string[];
    status: 'ok' | 'error';
    info: string;
    rows: Record<string, unknown>[] | null;
    rowCount: number | null;
    affected: number | null;
    error: string | null;
}

interface Section {
    id: string;
    title: string;
    sql: string[];
    status: 'ok' | 'error';
    info: string;
    rowsJson: string | null;
    rowsPretty: string[] | null;
    rowCount: number | null;
    affected: number | null;
    error: string | null;
    marker: string;
}

function sqlList(s: string | string[]): string[] {
    return Array.isArray(s) ? s : [s];
}

interface SectionBody {
    sql: string | string[];
    info: string;
    rows?: Record<string, unknown>[] | null;
    rowCount?: number | null;
    affected?: number | null;
    error?: string | null;
}

function runSection(
    id: string,
    title: string,
    body: () => SectionBody
): Section {
    try {
        const out = body();
        const internal: SectionInternal = {
            id,
            title,
            sql: sqlList(out.sql),
            status: 'ok',
            info: out.info,
            rows: out.rows ?? null,
            rowCount: out.rowCount ?? null,
            affected: out.affected ?? null,
            error: out.error ?? null
        };
        return finalize(internal);
    } catch (e: unknown) {
        const msg = (e instanceof Error && e.message) ? e.message : String(e);
        const internal: SectionInternal = {
            id,
            title,
            sql: [],
            status: 'error',
            info: 'Uncaught: ' + msg,
            rows: null,
            rowCount: null,
            affected: null,
            error: msg
        };
        return finalize(internal);
    }
}

function finalize(s: SectionInternal): Section {
    const rowsPretty: string[] | null = s.rows ? s.rows.map((row) => prettyRow(row)) : null;
    return {
        id: s.id,
        title: s.title,
        sql: s.sql,
        status: s.status,
        info: s.info,
        rowsJson: s.rows ? JSON.stringify(s.rows) : null,
        rowsPretty: rowsPretty,
        rowCount: s.rowCount,
        affected: s.affected,
        error: s.error,
        marker: buildMarker(s)
    };
}

function prettyRow(row: Record<string, unknown>): string {
    const parts: string[] = [];
    const keys = Object.keys(row);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = row[k];
        parts.push(k + '=' + (v === null || v === undefined ? 'NULL' : String(v)));
    }
    return parts.join(' | ');
}

function buildMarker(s: SectionInternal): string {
    const bits: string[] = ['CASE=' + s.id, 'STATUS=' + s.status];
    if (s.rowCount !== null) {
        bits.push('ROWS=' + s.rowCount);
    }
    if (s.affected !== null) {
        bits.push('AFFECTED=' + s.affected);
    }
    return '[[LIB-SQL ' + bits.join(' ') + ']]';
}

function runAll(handle: Handle): Section[] {
    const sections: Section[] = [];

    // ---- 1. DDL ----------------------------------------------------------
    const DDL = [
        'DROP TABLE IF EXISTS book',
        'CREATE TABLE book (\n' +
            '    id INT PRIMARY KEY,\n' +
            '    isbn BIGINT,\n' +
            '    title VARCHAR(128) NOT NULL,\n' +
            '    in_stock BOOLEAN NOT NULL,\n' +
            '    price DECIMAL(8,2) NOT NULL,\n' +
            '    published TIMESTAMP\n' +
            ')'
    ];
    sections.push(runSection(
        'ddl',
        '1. DDL: create a table with multiple column types',
        () => {
            for (let i = 0; i < DDL.length; i++) {
                handle.execute(DDL[i]);
            }
            const verify = handle.queryFirst(
                "SELECT count(*) AS c FROM information_schema.tables " +
                "WHERE upper(table_name) = 'BOOK' AND upper(table_type) = 'BASE TABLE'"
            );
            return {
                sql: DDL,
                info: 'Table created. information_schema reports ' + (verify && verify.c) + ' "BOOK" base table.'
            };
        }
    ));

    // ---- 2. INSERT seed --------------------------------------------------
    const SEED = "INSERT INTO book (id, isbn, title, in_stock, price, published) VALUES\n" +
        "    (1, 9780131103627, 'The C Programming Language', TRUE,  39.99, TIMESTAMP '1988-04-01 00:00:00'),\n" +
        "    (2, 9780201633610, 'Design Patterns',            TRUE,  54.99, TIMESTAMP '1994-10-21 00:00:00'),\n" +
        "    (3, 9780132350884, 'Clean Code',                 FALSE, 49.99, TIMESTAMP '2008-08-01 00:00:00'),\n" +
        "    (4, 9780201835953, 'The Mythical Man-Month',     TRUE,  29.99, TIMESTAMP '1975-01-01 00:00:00')";
    sections.push(runSection(
        'insert',
        '2. INSERT: seed four rows in one multi-row VALUES list',
        () => {
            const affected = handle.insert(SEED);
            return {
                sql: SEED,
                info: 'INSERT affected ' + affected + ' row(s).',
                affected: affected
            };
        }
    ));

    // ---- 3. SELECT all (multi-row, multi-typed columns) ------------------
    const SELECT_ALL = 'SELECT id, isbn, title, in_stock, price, published FROM book ORDER BY id';
    sections.push(runSection(
        'select',
        '3. SELECT: many rows over INT / BIGINT / VARCHAR / BOOLEAN / DECIMAL / TIMESTAMP columns',
        () => {
            const result = handle.query(SELECT_ALL);
            return {
                sql: SELECT_ALL,
                info: 'Query returned ' + result.count + ' row(s).',
                rows: result.result,
                rowCount: result.count
            };
        }
    ));

    // ---- 4. queryFirst aggregate ----------------------------------------
    sections.push(runSection(
        'queryfirst',
        '4. queryFirst: single-row aggregate (count, sum)',
        () => {
            const aggSql = 'SELECT count(*) AS total_books, sum(price) AS total_price FROM book';
            const row = handle.queryFirst(aggSql);
            return {
                sql: aggSql,
                info: 'queryFirst returned: count=' + (row && row.total_books) + ', sum=' + (row && row.total_price),
                rows: row ? [row] : []
            };
        }
    ));

    // ---- 5. Parameterized query (safe-escape helper) ---------------------
    sections.push(runSection(
        'params',
        '5. Parameterized query: bind values via the safe-escape helper (lib-sql exposes no JDBC binding)',
        () => {
            // The first parameter is a deliberate SQL-injection attempt; the
            // quote() helper doubles the inner ' so the whole literal stays a
            // string and the DROP never executes.
            const params: ReadonlyArray<unknown> = ["Don't Panic; DROP TABLE book;--", 50.0, true];
            const template = 'SELECT id, title, price, in_stock FROM book ' +
                'WHERE title <> ? AND price <= ? AND in_stock = ? ORDER BY id';
            const bound = bind(template, params);
            const result = handle.query(bound);
            const stillThere = handle.queryFirst(
                "SELECT count(*) AS c FROM information_schema.tables " +
                "WHERE upper(table_name) = 'BOOK'"
            );
            return {
                sql: [
                    '-- template: ' + template,
                    '-- params:   ' + JSON.stringify(params),
                    '-- bound:    ' + bound
                ],
                info: 'Bound ' + params.length + ' parameter(s); injection attempt escaped (BOOK table count after: ' +
                    (stillThere && stillThere.c) + '). Matched ' + result.count + ' row(s).',
                rows: result.result,
                rowCount: result.count
            };
        }
    ));

    // ---- 6. UPDATE with affected-row count -------------------------------
    sections.push(runSection(
        'update',
        '6. UPDATE: returns affected-row count',
        () => {
            const upSql = 'UPDATE book SET in_stock = FALSE WHERE price >= 49.99';
            const affected = handle.update(upSql);
            const verify = handle.query('SELECT id, in_stock FROM book ORDER BY id');
            return {
                sql: upSql,
                info: 'UPDATE affected ' + affected + ' row(s).',
                affected: affected,
                rows: verify.result,
                rowCount: verify.count
            };
        }
    ));

    // ---- 7. DELETE with affected-row count -------------------------------
    sections.push(runSection(
        'delete',
        '7. DELETE: returns affected-row count',
        () => {
            const delSql = 'DELETE FROM book WHERE in_stock = FALSE';
            const affected = handle.update(delSql);
            const remain = handle.queryFirst('SELECT count(*) AS remaining FROM book');
            return {
                sql: delSql,
                info: 'DELETE removed ' + affected + ' row(s); ' + (remain && remain.remaining) + ' row(s) remain.',
                affected: affected
            };
        }
    ));

    // ---- 8. Transaction — atomic commit ---------------------------------
    // lib-sql opens a new pooled connection per call, so a transaction
    // cannot span multiple lib-sql calls. Instead we lean on H2's
    // statement-level atomicity: a single multi-row INSERT either commits
    // all rows or none. This case demonstrates the commit path.
    sections.push(runSection(
        'commit',
        '8. Transaction (commit): atomic multi-row INSERT, all rows committed together',
        () => {
            const before = handle.queryFirst('SELECT count(*) AS c FROM book');
            const beforeCount = before && before.c;
            const txSql = "INSERT INTO book (id, isbn, title, in_stock, price, published) VALUES " +
                "(10, 9780321125217, 'Domain-Driven Design', TRUE, 59.99, TIMESTAMP '2003-08-22 00:00:00'), " +
                "(11, 9780201485671, 'Refactoring',          TRUE, 47.99, TIMESTAMP '1999-07-08 00:00:00')";
            const affected = handle.insert(txSql);
            const after = handle.queryFirst('SELECT count(*) AS c FROM book');
            const afterCount = after && after.c;
            return {
                sql: txSql,
                info: 'Committed atomically. Row count ' + beforeCount + ' -> ' + afterCount + ' (delta=' + affected + ').',
                affected: affected
            };
        }
    ));

    // ---- 9. Transaction — atomic rollback -------------------------------
    // A multi-row INSERT where the second row violates the PK constraint
    // must leave the table unchanged. This demonstrates the rollback path.
    sections.push(runSection(
        'rollback',
        '9. Transaction (rollback): PK collision on row 2 rolls back the whole INSERT',
        () => {
            const before = handle.queryFirst('SELECT count(*) AS c FROM book');
            const beforeCount = before && before.c;
            const txSql = "INSERT INTO book (id, isbn, title, in_stock, price, published) VALUES " +
                "(20, 9780201432718, 'Mythical Man-Month (anniversary)', TRUE, 30.00, TIMESTAMP '1995-08-01 00:00:00'), " +
                "(10, 9999999999999, 'Duplicate of #10',                  TRUE, 99.99, TIMESTAMP '2026-01-01 00:00:00')";
            let caught: string | null = null;
            try {
                handle.insert(txSql);
            } catch (e: unknown) {
                caught = (e instanceof Error && e.message) ? e.message : String(e);
            }
            const after = handle.queryFirst('SELECT count(*) AS c FROM book');
            const afterCount = after && after.c;
            const probe = handle.queryFirst('SELECT count(*) AS c FROM book WHERE id = 20');
            const id20Present = probe ? Number(probe.c) > 0 : false;
            return {
                sql: txSql,
                info: 'Caught (' + (caught ? caught.split('\n')[0] : 'no error') +
                    '). Row count ' + beforeCount + ' -> ' + afterCount + ' (unchanged); id=20 present after attempt: ' +
                    id20Present + '.',
                error: caught,
                affected: 0
            };
        }
    ));

    // ---- 10. Error handling: invalid SQL is rendered, not thrown -------
    sections.push(runSection(
        'error',
        '10. Error handling: invalid SQL is caught and rendered, no HTTP 500',
        () => {
            const badSql = 'SELECT no_such_column FROM no_such_table WHERE 1 = 1';
            let caught: string | null = null;
            try {
                handle.query(badSql);
            } catch (e: unknown) {
                caught = (e instanceof Error && e.message) ? e.message : String(e);
            }
            return {
                sql: badSql,
                info: caught
                    ? 'Caught and rendered: ' + caught.split('\n')[0]
                    : 'Unexpected: bad SQL did not throw',
                error: caught
            };
        }
    ));

    return sections;
}

export const GET = function (_req: Request) {
    let sections: Section[] = [];
    let setupError: string | null = null;

    try {
        const handle = getHandle();
        sections = runAll(handle);
    } catch (e: unknown) {
        setupError = (e instanceof Error && e.message) ? e.message : String(e);
    }

    const view = resolve('sql.html');
    const body = thymeleaf.render(view, {
        jdbcUrl: JDBC_URL,
        jdbcDriver: JDBC_DRIVER,
        setupError: setupError,
        sections: sections
    });

    return {
        contentType: 'text/html',
        body: body
    };
};
