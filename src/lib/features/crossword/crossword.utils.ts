import {
	INITIAL_CROSSWORD_ENTRY_COUNT,
	MAX_CROSSWORD_ENTRY_COUNT
} from '$lib/features/crossword/crossword.constants';

import type {
	CrosswordEntry,
	CrosswordEntryField,
	CrosswordLayout
} from '$lib/features/crossword/crossword.types';

export function createCrosswordEntry(sequence: number): CrosswordEntry {
	return {
		id: `entry-${sequence}`,
		clue: '',
		answer: ''
	};
}

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
 * ID hanya identitas stabil; tidak mengikuti nomor soal setelah ada entry yang dihapus.
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

export function removeCrosswordEntry(entries: CrosswordEntry[], entryId: string): CrosswordEntry[] {
	return entries.filter((entry) => entry.id !== entryId);
}

/**
 * Bentuk jawaban yang dipakai generator; teks asli tetap disimpan di editor.
 */
export function normalizeAnswer(answer: string): string {
	return answer
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toUpperCase();
}

/**
 * Complete = clue terisi dan answer valid setelah normalisasi.
 */
export function countCompletedCrosswordEntries(entries: CrosswordEntry[]): number {
	return entries.filter((entry) => entry.clue.trim() !== '' && normalizeAnswer(entry.answer) !== '')
		.length;
}

/**
 * Clue tidak wajib: answer saja sudah cukup untuk preview.
 */
export function countCrosswordAnswerEntries(entries: CrosswordEntry[]): number {
	return entries.filter((entry) => normalizeAnswer(entry.answer) !== '').length;
}

/**
 * Layout di-generate ulang hanya bila signature berubah.
 *
 * Nomor soal ikut dimasukkan karena menghapus soal kosong di tengah
 * menggeser nomor soal berikutnya walaupun answer-nya sama.
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

export function createEmptyCrosswordLayout(): CrosswordLayout {
	return {
		placements: [],

		cells: [],

		unplacedEntries: [],

		width: 0,

		height: 0,

		intersectionCount: 0
	};
}
