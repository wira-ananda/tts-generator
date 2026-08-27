import { describe, expect, it } from 'vitest';

import { MAX_CROSSWORD_ENTRY_COUNT } from '$lib/features/crossword/crossword.constants';
import {
	countCompletedCrosswordEntries,
	createInitialCrosswordEntries,
	getNextCrosswordEntrySequence,
	removeCrosswordEntry,
	updateCrosswordEntry
} from '$lib/features/crossword/crossword.utils';

describe('crossword utils', () => {
	it('creates 10 initial crossword entries by default', () => {
		const entries = createInitialCrosswordEntries();

		expect(entries).toHaveLength(10);
		expect(entries[0]).toEqual({
			id: 'entry-1',
			clue: '',
			answer: ''
		});
		expect(entries[9]?.id).toBe('entry-10');
	});

	it('does not create more than the maximum entry count', () => {
		const entries = createInitialCrosswordEntries(999);

		expect(entries).toHaveLength(MAX_CROSSWORD_ENTRY_COUNT);
	});

	it('returns the next sequence based on the highest existing entry id', () => {
		const entries = createInitialCrosswordEntries(10);

		const remainingEntries = removeCrosswordEntry(entries, 'entry-5');

		expect(getNextCrosswordEntrySequence(remainingEntries)).toBe(11);
	});

	it('updates only the requested entry field', () => {
		const entries = createInitialCrosswordEntries(2);

		const updatedEntries = updateCrosswordEntry(entries, 'entry-2', 'answer', 'Svelte');

		expect(updatedEntries[0]).toEqual(entries[0]);
		expect(updatedEntries[1]?.answer).toBe('Svelte');
		expect(updatedEntries[1]?.clue).toBe('');
	});

	it('removes only the requested entry', () => {
		const entries = createInitialCrosswordEntries(3);

		const updatedEntries = removeCrosswordEntry(entries, 'entry-2');

		expect(updatedEntries).toHaveLength(2);
		expect(updatedEntries.map((entry) => entry.id)).toEqual(['entry-1', 'entry-3']);
	});

	it('counts only entries with both clue and answer', () => {
		const entries = createInitialCrosswordEntries(3);

		const withFirstClue = updateCrosswordEntry(entries, 'entry-1', 'clue', 'Framework frontend');

		const withFirstAnswer = updateCrosswordEntry(withFirstClue, 'entry-1', 'answer', 'Svelte');

		const withSecondAnswerOnly = updateCrosswordEntry(
			withFirstAnswer,
			'entry-2',
			'answer',
			'Laravel'
		);

		expect(countCompletedCrosswordEntries(withSecondAnswerOnly)).toBe(1);
	});
});
