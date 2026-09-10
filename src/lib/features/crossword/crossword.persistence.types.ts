import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

export type CrosswordSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type CrosswordDraft = {
	version: 1;
	entries: CrosswordEntry[];
	title: string;
	updatedAt: string;
};

export type CrosswordHistoryItem = {
	id: string;
	label: string;
	savedAt: string;
	entries: CrosswordEntry[];
};

export type CrosswordHistoryStore = {
	version: 1;
	items: CrosswordHistoryItem[];
};
