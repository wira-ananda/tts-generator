import {
	INITIAL_CROSSWORD_ENTRY_COUNT,
	MAX_CROSSWORD_ENTRY_COUNT
} from '$lib/features/crossword/crossword.constants';

import type {
	CrosswordEntry,
	CrosswordEntryField,
	CrosswordLayout
} from '$lib/features/crossword/crossword.types';

/**
 * Membuat satu entry TTS dengan identifier stabil.
 */
export function createCrosswordEntry(sequence: number): CrosswordEntry {
	return {
		id: `entry-${sequence}`,
		clue: '',
		answer: ''
	};
}

/**
 * Membuat kumpulan entry awal editor.
 */
export function createInitialCrosswordEntries(
	count = INITIAL_CROSSWORD_ENTRY_COUNT
): CrosswordEntry[] {
	const safeCount = Math.min(Math.max(count, 0), MAX_CROSSWORD_ENTRY_COUNT);

	return Array.from(
		{
			length: safeCount
		},
		(_, index) => createCrosswordEntry(index + 1)
	);
}

/**
 * Mengambil sequence ID berikutnya berdasarkan ID terbesar.
 *
 * ID tidak mengikuti visual numbering setelah remove.
 * ID hanya dipakai sebagai stable identity.
 */
export function getNextCrosswordEntrySequence(entries: CrosswordEntry[]): number {
	const highestSequence = entries.reduce((highest, entry) => {
		const match = /^entry-(\d+)$/.exec(entry.id);

		if (!match) {
			return highest;
		}

		const sequence = Number(match[1]);

		if (!Number.isFinite(sequence)) {
			return highest;
		}

		return Math.max(highest, sequence);
	}, 0);

	return highestSequence + 1;
}

/**
 * Mengubah satu field entry secara immutable.
 */
export function updateCrosswordEntry(
	entries: CrosswordEntry[],
	entryId: string,
	field: CrosswordEntryField,
	value: string
): CrosswordEntry[] {
	return entries.map((entry) => {
		if (entry.id !== entryId) {
			return entry;
		}

		return {
			...entry,
			[field]: value
		};
	});
}

/**
 * Menghapus satu entry berdasarkan ID.
 */
export function removeCrosswordEntry(entries: CrosswordEntry[], entryId: string): CrosswordEntry[] {
	return entries.filter((entry) => entry.id !== entryId);
}

/**
 * Jawaban original tetap disimpan di editor.
 *
 * Crossword hanya menggunakan versi normalized.
 */
export function normalizeAnswer(answer: string): string {
	return answer
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toUpperCase();
}

/**
 * Entry dianggap complete apabila clue dan answer valid terisi.
 */
export function countCompletedCrosswordEntries(entries: CrosswordEntry[]): number {
	return entries.filter((entry) => entry.clue.trim() !== '' && normalizeAnswer(entry.answer) !== '')
		.length;
}

/**
 * Menghitung answer yang dapat dicoba generator.
 *
 * Answer boleh menghasilkan preview walaupun clue belum diisi.
 */
export function countCrosswordAnswerEntries(entries: CrosswordEntry[]): number {
	return entries.filter((entry) => normalizeAnswer(entry.answer) !== '').length;
}

/**
 * Signature menentukan kapan layout perlu regenerate.
 *
 * Selain answer, questionNumber ikut dimasukkan.
 *
 * Ini penting karena jika user menghapus Question 2 yang kosong,
 * Question 3 berubah menjadi Question 2 walaupun answer-nya sama.
 * Grid dan clue numbering tetap harus ikut berubah.
 */
export function createCrosswordGenerationSignature(entries: CrosswordEntry[]): string {
	const values = entries
		.map((entry, index) => ({
			id: entry.id,

			questionNumber: index + 1,

			answer: normalizeAnswer(entry.answer)
		}))
		.filter((entry) => entry.answer !== '');

	return JSON.stringify(values);
}

/**
 * Initial / reset layout.
 */
export function createEmptyCrosswordLayout(): CrosswordLayout {
	return {
		placements: [],

		cells: [],

		unplacedEntryIds: [],

		unplacedEntries: [],

		width: 0,

		height: 0,

		intersectionCount: 0
	};
}
