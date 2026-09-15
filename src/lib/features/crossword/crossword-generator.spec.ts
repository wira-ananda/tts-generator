import { describe, expect, it } from 'vitest';

import { buildCrosswordLayout } from '$lib/features/crossword/crossword-generator';
import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';
import { normalizeAnswer } from '$lib/features/crossword/crossword.utils';

function createEntry(id: string, answer: string, clue = 'Test clue'): CrosswordEntry {
	return {
		id,
		clue,
		answer
	};
}

describe('normalizeAnswer', () => {
	it('normalizes spaces, punctuation and casing', () => {
		expect(normalizeAnswer('Web Development!')).toBe('WEBDEVELOPMENT');
	});

	it('removes latin diacritics', () => {
		expect(normalizeAnswer('Café')).toBe('CAFE');
	});

	it('preserves numbers', () => {
		expect(normalizeAnswer('HTML 5')).toBe('HTML5');
	});
});

describe('buildCrosswordLayout', () => {
	it('places one valid answer', () => {
		const layout = buildCrosswordLayout([createEntry('entry-1', 'Laravel')]);

		expect(layout.placements).toHaveLength(1);

		expect(layout.unplacedEntries).toHaveLength(0);

		expect(layout.width).toBe(7);

		expect(layout.height).toBe(1);
	});

	it('creates a valid intersection between compatible answers', () => {
		const layout = buildCrosswordLayout([
			createEntry('entry-1', 'CAT'),
			createEntry('entry-2', 'CAR')
		]);

		expect(layout.placements).toHaveLength(2);

		expect(layout.intersectionCount).toBeGreaterThanOrEqual(1);

		expect(layout.unplacedEntries).toHaveLength(0);
	});

	it('marks an answer without matching letters as unplaced', () => {
		const layout = buildCrosswordLayout([
			createEntry('entry-1', 'CAT'),
			createEntry('entry-2', 'DOG')
		]);

		expect(layout.placements).toHaveLength(1);

		expect(layout.unplacedEntries).toEqual([
			{
				entryId: 'entry-2',

				answer: 'DOG',

				reason: 'no-intersection'
			}
		]);
	});

	it('allows two entries with the same normalized answer to both be placed', () => {
		const layout = buildCrosswordLayout([
			createEntry('entry-1', 'React'),
			createEntry('entry-2', 're-act')
		]);

		expect(layout.placements).toHaveLength(2);

		expect(layout.unplacedEntries).toHaveLength(0);

		expect(layout.intersectionCount).toBeGreaterThanOrEqual(1);
	});

	it('normalizes all final coordinates to positive grid space', () => {
		const layout = buildCrosswordLayout(
			[
				createEntry('entry-1', 'TYPESCRIPT'),
				createEntry('entry-2', 'REACT'),
				createEntry('entry-3', 'SVELTE')
			],
			{
				attempts: 3
			}
		);

		for (const cell of layout.cells) {
			expect(cell.x).toBeGreaterThanOrEqual(0);

			expect(cell.y).toBeGreaterThanOrEqual(0);
		}
	});

	it('shares numbering when across and down start from the same cell', () => {
		const layout = buildCrosswordLayout([
			createEntry('entry-1', 'CAT'),
			createEntry('entry-2', 'CAR')
		]);

		const first = layout.placements.find((placement) => placement.entryId === 'entry-1');

		const second = layout.placements.find((placement) => placement.entryId === 'entry-2');

		expect(first).toBeDefined();
		expect(second).toBeDefined();

		if (first && second && first.x === second.x && first.y === second.y) {
			expect(first.number).toBe(second.number);
		}
	});
});
