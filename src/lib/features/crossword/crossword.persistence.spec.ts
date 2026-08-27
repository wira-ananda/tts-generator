import { describe, expect, it } from 'vitest';

import { MAX_CROSSWORD_HISTORY_COUNT } from '$lib/features/crossword/crossword.constants';
import {
	createCrosswordHistoryItem,
	hasCrosswordEntryContent,
	parsePersistedCrosswordEntries,
	prependCrosswordHistoryItem
} from '$lib/features/crossword/crossword.persistence';
import {
	createInitialCrosswordEntries,
	updateCrosswordEntry
} from '$lib/features/crossword/crossword.utils';

describe('crossword persistence', () => {
	it('parses valid persisted entries', () => {
		const entries = [
			{
				id: 'entry-1',
				clue: 'Framework PHP',
				answer: 'Laravel'
			}
		];

		expect(parsePersistedCrosswordEntries(entries)).toEqual(entries);
	});

	it('rejects malformed persisted entries', () => {
		expect(
			parsePersistedCrosswordEntries([
				{
					id: 'entry-1',
					clue: 123,
					answer: 'Laravel'
				}
			])
		).toBeNull();
	});

	it('detects meaningful crossword content', () => {
		let entries = createInitialCrosswordEntries();

		expect(hasCrosswordEntryContent(entries)).toBe(false);

		entries = updateCrosswordEntry(entries, 'entry-1', 'clue', 'Framework PHP');

		expect(hasCrosswordEntryContent(entries)).toBe(true);
	});

	it('creates an independent history snapshot', () => {
		const entries = createInitialCrosswordEntries(1);

		const historyItem = createCrosswordHistoryItem(entries, 'Manual version', {
			id: 'history-1',
			savedAt: '2026-08-27T15:00:00.000Z'
		});

		expect(historyItem).toEqual({
			id: 'history-1',
			label: 'Manual version',
			savedAt: '2026-08-27T15:00:00.000Z',
			entries
		});

		expect(historyItem.entries).not.toBe(entries);
	});

	it('keeps history bounded', () => {
		const entries = createInitialCrosswordEntries(1);

		const currentItems = Array.from(
			{
				length: MAX_CROSSWORD_HISTORY_COUNT
			},
			(_, index) =>
				createCrosswordHistoryItem(entries, `Version ${index}`, {
					id: `history-${index}`,
					savedAt: '2026-08-27T15:00:00.000Z'
				})
		);

		const newestItem = createCrosswordHistoryItem(entries, 'Newest', {
			id: 'history-newest',
			savedAt: '2026-08-27T16:00:00.000Z'
		});

		const result = prependCrosswordHistoryItem(currentItems, newestItem);

		expect(result).toHaveLength(MAX_CROSSWORD_HISTORY_COUNT);

		expect(result[0]?.id).toBe('history-newest');
	});
});
