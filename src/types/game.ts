/**
 * Centralized type definitions for game-related data structures.
 * These interfaces describe the shape returned by the Drizzle data-access
 * helpers in `src/lib/games.ts` and consumed by Astro pages/components.
 */

/** Represents a game publisher (summary form used in listings). */
export interface Publisher {
    /** Unique identifier for the publisher */
    id: number;
    /** Name of the publisher */
    name: string;
}

/** Represents a game category (summary form used in listings). */
export interface Category {
    /** Unique identifier for the category */
    id: number;
    /** Name of the category */
    name: string;
}

/** Represents a game with its related category and publisher. */
export interface Game {
    /** Unique identifier for the game */
    id: number;
    /** Title of the game */
    title: string;
    /** Description of the game */
    description: string;
    /** Publisher of the game, or null if not assigned */
    publisher: Publisher | null;
    /** Category of the game, or null if not assigned */
    category: Category | null;
    /** Star rating for the game (0-5), or null if not yet rated */
    starRating: number | null;
}
