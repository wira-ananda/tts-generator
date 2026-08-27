import { describe, expect, it } from 'vitest';

import { getCrosswordDocxExportReadiness } from '$lib/features/crossword/crossword-docx-export';

import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

describe('crossword DOCX export', () => {
	it('exports current entries using editor numbering', () => {
		const entries: CrosswordEntry[] = [
			{
				id: 'entry-1',

				clue: 'Pertanyaan pertama',

				answer: 'Jawaban pertama'
			},

			{
				id: 'entry-2',

				clue: '',
				answer: ''
			},

			{
				id: 'entry-3',

				clue: 'Pertanyaan ketiga',

				answer: 'Jawaban ketiga'
			}
		];

		const result = getCrosswordDocxExportReadiness(entries);

		expect(result.ready).toBe(true);

		expect(result.entries).toEqual([
			{
				number: 1,

				question: 'Pertanyaan pertama',

				answer: 'Jawaban pertama'
			},

			{
				number: 3,

				question: 'Pertanyaan ketiga',

				answer: 'Jawaban ketiga'
			}
		]);
	});

	it('ignores completely empty editor slots', () => {
		const entries: CrosswordEntry[] = [
			{
				id: 'entry-1',

				clue: 'Soal',

				answer: 'Jawaban'
			},

			{
				id: 'entry-2',

				clue: '',
				answer: ''
			}
		];

		const result = getCrosswordDocxExportReadiness(entries);

		expect(result.ready).toBe(true);

		expect(result.entries).toHaveLength(1);
	});

	it('blocks export when a current question is incomplete', () => {
		const entries: CrosswordEntry[] = [
			{
				id: 'entry-1',

				clue: 'Soal tanpa jawaban',

				answer: ''
			}
		];

		const result = getCrosswordDocxExportReadiness(entries);

		expect(result.ready).toBe(false);

		expect(result.reason).toBe('Question 1 belum memiliki jawaban.');
	});
});
