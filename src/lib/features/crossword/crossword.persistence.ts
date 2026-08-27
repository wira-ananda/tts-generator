import { browser } from '$app/environment';

import {
	MAX_CROSSWORD_ENTRY_COUNT,
	MAX_CROSSWORD_HISTORY_COUNT
} from '$lib/features/crossword/crossword.constants';
import type {
	CrosswordDraft,
	CrosswordHistoryItem,
	CrosswordHistoryStore
} from '$lib/features/crossword/crossword.persistence.types';
import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

export const CROSSWORD_DRAFT_STORAGE_KEY = 'tts-generator:draft:v1';

export const CROSSWORD_HISTORY_STORAGE_KEY = 'tts-generator:history:v1';

type PersistenceResult = {
	success: boolean;
	savedAt: string | null;
};

type CreateHistoryOptions = {
	id?: string;
	savedAt?: string;
};

/**
 * Memastikan value merupakan plain object sebelum membaca property.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Membuat salinan entries agar history dan draft tidak berbagi reference
 * dengan state editor aktif.
 */
export function cloneCrosswordEntries(entries: CrosswordEntry[]): CrosswordEntry[] {
	return entries.map((entry) => ({
		id: entry.id,
		clue: entry.clue,
		answer: entry.answer
	}));
}

/**
 * Memvalidasi entries yang dibaca dari browser storage.
 */
export function parsePersistedCrosswordEntries(value: unknown): CrosswordEntry[] | null {
	if (!Array.isArray(value)) {
		return null;
	}

	if (value.length > MAX_CROSSWORD_ENTRY_COUNT) {
		return null;
	}

	const entries: CrosswordEntry[] = [];

	for (const item of value) {
		if (!isRecord(item)) {
			return null;
		}

		if (
			typeof item.id !== 'string' ||
			item.id.trim() === '' ||
			typeof item.clue !== 'string' ||
			typeof item.answer !== 'string'
		) {
			return null;
		}

		entries.push({
			id: item.id,
			clue: item.clue,
			answer: item.answer
		});
	}

	return entries;
}

/**
 * Mengecek apakah editor mempunyai content yang layak disimpan
 * sebagai version history.
 */
export function hasCrosswordEntryContent(entries: CrosswordEntry[]): boolean {
	return entries.some((entry) => entry.clue.trim() !== '' || entry.answer.trim() !== '');
}

/**
 * Membaca current draft dari localStorage.
 *
 * Data yang malformed akan diabaikan supaya aplikasi tetap bisa dibuka.
 */
export function readCrosswordDraft(): CrosswordDraft | null {
	if (!browser) {
		return null;
	}

	try {
		const rawDraft = window.localStorage.getItem(CROSSWORD_DRAFT_STORAGE_KEY);

		if (!rawDraft) {
			return null;
		}

		const parsedDraft: unknown = JSON.parse(rawDraft);

		if (
			!isRecord(parsedDraft) ||
			parsedDraft.version !== 1 ||
			typeof parsedDraft.updatedAt !== 'string'
		) {
			return null;
		}

		const entries = parsePersistedCrosswordEntries(parsedDraft.entries);

		if (!entries) {
			return null;
		}

		return {
			version: 1,
			entries,
			updatedAt: parsedDraft.updatedAt
		};
	} catch {
		return null;
	}
}

/**
 * Menyimpan current draft ke localStorage.
 */
export function saveCrosswordDraft(entries: CrosswordEntry[]): PersistenceResult {
	if (!browser) {
		return {
			success: false,
			savedAt: null
		};
	}

	const updatedAt = new Date().toISOString();

	const draft: CrosswordDraft = {
		version: 1,
		entries: cloneCrosswordEntries(entries),
		updatedAt
	};

	try {
		window.localStorage.setItem(CROSSWORD_DRAFT_STORAGE_KEY, JSON.stringify(draft));

		return {
			success: true,
			savedAt: updatedAt
		};
	} catch {
		return {
			success: false,
			savedAt: null
		};
	}
}

/**
 * Membuat identifier history yang cukup unik untuk local browser storage.
 */
function createHistoryId(): string {
	if (
		typeof globalThis.crypto !== 'undefined' &&
		typeof globalThis.crypto.randomUUID === 'function'
	) {
		return globalThis.crypto.randomUUID();
	}

	return `history-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Membuat immutable snapshot dari current crossword entries.
 */
export function createCrosswordHistoryItem(
	entries: CrosswordEntry[],
	label: string,
	options: CreateHistoryOptions = {}
): CrosswordHistoryItem {
	return {
		id: options.id ?? createHistoryId(),

		label,

		savedAt: options.savedAt ?? new Date().toISOString(),

		entries: cloneCrosswordEntries(entries)
	};
}

/**
 * Menambahkan history terbaru ke bagian atas dan menjaga
 * jumlah snapshot tetap bounded.
 */
export function prependCrosswordHistoryItem(
	currentItems: CrosswordHistoryItem[],
	newItem: CrosswordHistoryItem,
	maxItems = MAX_CROSSWORD_HISTORY_COUNT
): CrosswordHistoryItem[] {
	return [newItem, ...currentItems].slice(0, Math.max(maxItems, 0));
}

/**
 * Memvalidasi satu history item yang berasal dari localStorage.
 */
function parseCrosswordHistoryItem(value: unknown): CrosswordHistoryItem | null {
	if (!isRecord(value)) {
		return null;
	}

	if (
		typeof value.id !== 'string' ||
		value.id.trim() === '' ||
		typeof value.label !== 'string' ||
		typeof value.savedAt !== 'string'
	) {
		return null;
	}

	const entries = parsePersistedCrosswordEntries(value.entries);

	if (!entries) {
		return null;
	}

	return {
		id: value.id,
		label: value.label,
		savedAt: value.savedAt,
		entries
	};
}

/**
 * Membaca seluruh bounded history dari localStorage.
 */
export function readCrosswordHistory(): CrosswordHistoryItem[] {
	if (!browser) {
		return [];
	}

	try {
		const rawHistory = window.localStorage.getItem(CROSSWORD_HISTORY_STORAGE_KEY);

		if (!rawHistory) {
			return [];
		}

		const parsedHistory: unknown = JSON.parse(rawHistory);

		if (
			!isRecord(parsedHistory) ||
			parsedHistory.version !== 1 ||
			!Array.isArray(parsedHistory.items)
		) {
			return [];
		}

		const historyItems: CrosswordHistoryItem[] = [];

		for (const rawItem of parsedHistory.items) {
			const historyItem = parseCrosswordHistoryItem(rawItem);

			if (!historyItem) {
				continue;
			}

			historyItems.push(historyItem);

			if (historyItems.length >= MAX_CROSSWORD_HISTORY_COUNT) {
				break;
			}
		}

		return historyItems;
	} catch {
		return [];
	}
}

/**
 * Menulis seluruh bounded history ke localStorage.
 */
function writeCrosswordHistory(items: CrosswordHistoryItem[]): boolean {
	if (!browser) {
		return false;
	}

	const store: CrosswordHistoryStore = {
		version: 1,
		items: items.slice(0, MAX_CROSSWORD_HISTORY_COUNT)
	};

	try {
		window.localStorage.setItem(CROSSWORD_HISTORY_STORAGE_KEY, JSON.stringify(store));

		return true;
	} catch {
		return false;
	}
}

/**
 * Membuat dan menyimpan satu snapshot baru ke local history.
 */
export function addCrosswordHistorySnapshot(
	entries: CrosswordEntry[],
	label: string
): CrosswordHistoryItem[] | null {
	if (!browser) {
		return null;
	}

	const currentHistory = readCrosswordHistory();

	const historyItem = createCrosswordHistoryItem(entries, label);

	const nextHistory = prependCrosswordHistoryItem(currentHistory, historyItem);

	if (!writeCrosswordHistory(nextHistory)) {
		return null;
	}

	return nextHistory;
}
