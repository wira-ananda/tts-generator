import { describe, expect, it } from 'vitest';

import {
	applyCrosswordImport,
	countTrailingBlankCrosswordEntries,
	parseCrosswordCsvText,
	validateCrosswordImport
} from '$lib/features/crossword/crossword-import';

import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

import {
	createInitialCrosswordEntries,
	updateCrosswordEntry
} from '$lib/features/crossword/crossword.utils';

describe('crossword import parser', () => {
	it('parses standard CSV', () => {
		const source = parseCrosswordCsvText(
			['question,answer', 'Framework PHP,Laravel', 'Library JavaScript,React'].join('\n')
		);

		expect(source.rows).toEqual([
			{
				sourceRowNumber: 2,

				question: 'Framework PHP',

				answer: 'Laravel'
			},
			{
				sourceRowNumber: 3,

				question: 'Library JavaScript',

				answer: 'React'
			}
		]);
	});

	it('parses quoted comma in CSV', () => {
		const source = parseCrosswordCsvText(
			['question,answer', '"Library, JavaScript",React'].join('\n')
		);

		expect(source.rows[0]).toEqual({
			sourceRowNumber: 2,

			question: 'Library, JavaScript',

			answer: 'React'
		});
	});

	it('rejects missing required headers', () => {
		expect(() =>
			parseCrosswordCsvText(['clue,result', 'Framework PHP,Laravel'].join('\n'))
		).toThrow('question');
	});
});

describe('crossword import validation', () => {
	it('returns row-specific validation issues', () => {
		const source = parseCrosswordCsvText(
			['question,answer', ',Laravel', 'Library JavaScript,', 'Framework,***'].join('\n')
		);

		const validation = validateCrosswordImport(source, [], 'replace');

		expect(validation.validRowCount).toBe(0);

		expect(validation.invalidRowCount).toBe(3);

		expect(validation.issues.map((issue) => issue.rowNumber)).toEqual([2, 3, 4]);
	});

	it('detects duplicate answers inside import', () => {
		const source = parseCrosswordCsvText(
			['question,answer', 'Library JS,React', 'Another clue,re-act'].join('\n')
		);

		const validation = validateCrosswordImport(source, [], 'replace');

		expect(validation.validRowCount).toBe(1);

		expect(validation.duplicateRowCount).toBe(1);

		expect(validation.issues[0]?.code).toBe('duplicate-import');
	});

	it('detects duplicate against existing entries when appending', () => {
		let entries = createInitialCrosswordEntries(1);

		entries = updateCrosswordEntry(entries, 'entry-1', 'answer', 'Laravel');

		const source = parseCrosswordCsvText(['question,answer', 'Framework PHP,laravel'].join('\n'));

		const validation = validateCrosswordImport(source, entries, 'append');

		expect(validation.validRowCount).toBe(0);

		expect(validation.issues[0]?.code).toBe('duplicate-existing');
	});
});

describe('crossword import merge', () => {
	it('counts only trailing blank entries as reusable slots', () => {
		const entries: CrosswordEntry[] = [
			{
				id: 'entry-1',
				clue: 'One',
				answer: 'ONE'
			},
			{
				id: 'entry-2',
				clue: '',
				answer: ''
			},
			{
				id: 'entry-3',
				clue: 'Three',
				answer: 'THREE'
			},
			{
				id: 'entry-4',
				clue: '',
				answer: ''
			},
			{
				id: 'entry-5',
				clue: '',
				answer: ''
			}
		];

		expect(countTrailingBlankCrosswordEntries(entries)).toBe(2);
	});

	it('fills trailing blank forms before appending', () => {
		const entries = createInitialCrosswordEntries(3);

		entries[0] = {
			id: 'entry-1',
			clue: 'Existing',
			answer: 'EXISTING'
		};

		const source = parseCrosswordCsvText(
			['question,answer', 'Framework PHP,Laravel', 'Library JavaScript,React'].join('\n')
		);

		const validation = validateCrosswordImport(source, entries, 'append');

		const result = applyCrosswordImport(entries, validation.validRows, 'append');

		expect(result).toHaveLength(3);

		expect(result[1]).toMatchObject({
			id: 'entry-2',

			clue: 'Framework PHP',

			answer: 'Laravel'
		});

		expect(result[2]).toMatchObject({
			id: 'entry-3',

			clue: 'Library JavaScript',

			answer: 'React'
		});
	});

	it('replaces current entries cleanly', () => {
		const current = createInitialCrosswordEntries();

		const source = parseCrosswordCsvText(
			['question,answer', 'Framework PHP,Laravel', 'Library JavaScript,React'].join('\n')
		);

		const validation = validateCrosswordImport(source, current, 'replace');

		const result = applyCrosswordImport(current, validation.validRows, 'replace');

		expect(result).toEqual([
			{
				id: 'entry-1',

				clue: 'Framework PHP',

				answer: 'Laravel'
			},
			{
				id: 'entry-2',

				clue: 'Library JavaScript',

				answer: 'React'
			}
		]);
	});
});
import { parseCrosswordWordText } from '$lib/features/crossword/crossword-import';

it('parses numbered Word format', () => {
	const source = parseCrosswordWordText(
		['1. Anuan ituan = apabagus', '2. Ituan inian = apaitu'].join('\n\n')
	);

	expect(source.rows).toEqual([
		{
			sourceRowNumber: 1,

			question: 'Anuan ituan',

			answer: 'apabagus'
		},
		{
			sourceRowNumber: 2,

			question: 'Ituan inian',

			answer: 'apaitu'
		}
	]);
});

it('marks malformed Word row through empty answer', () => {
	const source = parseCrosswordWordText('1. Pertanyaan tanpa pemisah');

	expect(source.rows[0]).toEqual({
		sourceRowNumber: 1,

		question: 'Pertanyaan tanpa pemisah',

		answer: ''
	});
});
