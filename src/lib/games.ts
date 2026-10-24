import { eq, asc } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

/**
 * Maps a database row to a Game object with related publisher and category information.
 * @param {GameSelectionRow} row - The database row containing game and related data
 * @returns {Game} A Game object with joined publisher and category data
 */
function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

/**
 * Builds the base query for fetching games with their related categories and publishers.
 * Uses left joins to include category and publisher information.
 * @param {Database} db - The injected database instance
 * @returns The base Drizzle query builder for games with joins
 */
function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Retrieves all games ordered by title.
 * @param {Database} db - The injected database instance
 * @returns {Promise<Game[]>} Array of all games with publisher and category information
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    const rows = await baseGamesQuery(db).orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * Retrieves all game IDs ordered by title.
 * Used for generating static routes in dynamic page generation.
 * @param {Database} db - The injected database instance
 * @returns {Promise<number[]>} Array of all game IDs in title order
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * Retrieves a single game by its ID with all related information.
 * @param {Database} db - The injected database instance
 * @param {number} id - The game ID to fetch
 * @returns {Promise<Game | null>} The game object if found, null otherwise
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
