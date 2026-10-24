import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import type { AsyncRemoteCallback, SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../../db/schema';

/**
 * Type alias for the Drizzle SQLite database instance.
 * Used for type-safe database access throughout the application.
 */
export type Database = SqliteRemoteDatabase<typeof schema>;

/**
 * Represents both the Drizzle database client and underlying Node SQLite connection.
 * Used in scenarios where both are needed (e.g., migrations).
 * @property {Database} db - The Drizzle ORM client for queries
 * @property {DatabaseSync} sqlite - The Node.js built-in SQLite connection for direct execution
 */
export interface DatabaseConnection {
    db: Database;
    sqlite: DatabaseSync;
}

/** Default local SQLite file used for dev/build when DATABASE_URL is unset. */
const DEFAULT_DATABASE_URL = 'file:tailspin.db';

let cachedDb: Database | undefined;

/**
 * Converts a database URL to a path compatible with Node's built-in SQLite driver.
 * Supports local file paths (file: URLs) and :memory: for testing.
 * @param {string} url - Database URL (file:// URL or :memory:)
 * @returns {string} Path for DatabaseSync constructor
 * @throws {Error} If URL is not a valid file: URL or :memory:
 */
function databasePath(url: string): string {
    if (url === ':memory:') {
        return url;
    }

    if (!url.startsWith('file:')) {
        throw new Error('DATABASE_URL must be a local file: URL or :memory:.');
    }

    const filePath = url.startsWith('file://') ? fileURLToPath(url) : url.slice('file:'.length);
    if (!filePath) {
        throw new Error('DATABASE_URL must include a database file path.');
    }

    mkdirSync(dirname(filePath), { recursive: true });
    return filePath;
}

/**
 * Creates an async callback adapter that bridges Drizzle's async SQLite proxy
 * to Node's synchronous built-in sqlite driver.
 * @param {DatabaseSync} sqlite - Node's SQLite connection instance
 * @returns {AsyncRemoteCallback} Async callback function for Drizzle remote proxy
 */
function createRemoteCallback(sqlite: DatabaseSync): AsyncRemoteCallback {
    return async (sql: string, params: SQLInputValue[], method: 'run' | 'all' | 'values' | 'get') => {
        const statement = sqlite.prepare(sql);

        switch (method) {
            case 'run':
                statement.run(...params);
                return { rows: [] };
            case 'all':
                return { rows: statement.all(...params).map((row) => Object.values(row)) };
            case 'values':
                return { rows: statement.all(...params).map((row) => Object.values(row)) };
            case 'get': {
                const row = statement.get(...params);
                // Drizzle's proxy type requires an array, but its get mapper accepts no row.
                return { rows: row === undefined ? (undefined as unknown as never[]) : Object.values(row) };
            }
        }
    };
}

/**
 * Executes migration SQL statements atomically within a transaction.
 * Ensures all migrations succeed or all roll back together.
 * @param {DatabaseSync} sqlite - Node SQLite connection
 * @param {string[]} queries - Array of SQL migration statements
 * @throws {Error} If any migration statement fails
 */
export function executeMigrationQueries(sqlite: DatabaseSync, queries: string[]): void {
    sqlite.exec('BEGIN');
    try {
        for (const query of queries) {
            sqlite.exec(query);
        }
        sqlite.exec('COMMIT');
    } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
    }
}

/**
 * Creates a Drizzle database client for the given SQLite connection URL.
 * Defaults to the local tailspin.db file if no DATABASE_URL is provided.
 * @param {string} [url] - Database URL (defaults to file:tailspin.db)
 * @returns {Database} Drizzle client ready for queries
 */
export function createDatabase(url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL): Database {
    return createDatabaseConnection(url).db;
}

/**
 * Creates both the Drizzle client and underlying SQLite connection.
 * Used in contexts where both are needed (migrations, seeding).
 * @param {string} [url] - Database URL (defaults to file:tailspin.db)
 * @returns {DatabaseConnection} Object with both db and sqlite properties
 */
export function createDatabaseConnection(
    url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
): DatabaseConnection {
    const sqlite = new DatabaseSync(databasePath(url));
    sqlite.exec('PRAGMA short_column_names = OFF; PRAGMA full_column_names = ON;');
    const db = drizzle(createRemoteCallback(sqlite), { schema });
    return { db, sqlite };
}

/**
 * Gets or creates the shared singleton database instance.
 * Used by Astro pages at build time to query data with a single connection.
 * @returns {Database} Cached Drizzle database client
 */
export function getDatabase(): Database {
    if (!cachedDb) {
        cachedDb = createDatabase();
    }
    return cachedDb;
}
