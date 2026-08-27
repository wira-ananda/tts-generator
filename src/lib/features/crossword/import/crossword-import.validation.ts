import { MAX_CROSSWORD_ENTRY_COUNT } from '$lib/features/crossword/crossword.constants';

import type {
	CrosswordImportMergeMode,
	CrosswordImportSource,
	CrosswordImportValidatedRow,
	CrosswordImportValidation
} from '$lib/features/crossword/crossword-import.types';

import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

import {
	createCrosswordEntry,
	getNextCrosswordEntrySequence,
	normalizeAnswer
} from '$lib/features/crossword/crossword.utils';

function isEntryCompletelyBlank(entry: CrosswordEntry): boolean {
	return entry.clue.trim() === '' && entry.answer.trim() === '';
}

/**
 * Menghitung blank forms yang berada di bagian paling akhir editor.
 */
export function countTrailingBlankCrosswordEntries(entries: CrosswordEntry[]): number {
	let count = 0;

	for (let index = entries.length - 1; index >= 0; index -= 1) {
		const entry = entries[index];

		if (!entry || !isEntryCompletelyBlank(entry)) {
			break;
		}

		count += 1;
	}

	return count;
}

/**
 * Menghitung kapasitas import berdasarkan mode.
 */
export function getCrosswordImportCapacity(
	currentEntries: CrosswordEntry[],
	mode: CrosswordImportMergeMode
): number {
	if (mode === 'replace') {
		return MAX_CROSSWORD_ENTRY_COUNT;
	}

	return (
		MAX_CROSSWORD_ENTRY_COUNT -
		currentEntries.length +
		countTrailingBlankCrosswordEntries(currentEntries)
	);
}

function getProjectedEntryCount(
	currentEntries: CrosswordEntry[],
	importCount: number,
	mode: CrosswordImportMergeMode
): number {
	if (mode === 'replace') {
		return importCount;
	}

	const reusableCount = Math.min(countTrailingBlankCrosswordEntries(currentEntries), importCount);

	return currentEntries.length + importCount - reusableCount;
}

/**
 * Validasi row import tanpa memodifikasi current editor state.
 */
export function validateCrosswordImport(
	source: CrosswordImportSource,
	currentEntries: CrosswordEntry[],
	mode: CrosswordImportMergeMode
): CrosswordImportValidation {
	const validRows: CrosswordImportValidatedRow[] = [];

	const issues: CrosswordImportValidation['issues'] = [];

	const importedAnswers = new Set<string>();

	const existingAnswers = new Set<string>();

	if (mode === 'append') {
		for (const entry of currentEntries) {
			const answer = normalizeAnswer(entry.answer);

			if (answer) {
				existingAnswers.add(answer);
			}
		}
	}

	let duplicateRowCount = 0;

	for (const row of source.rows) {
		const question = row.question.trim();

		const answer = row.answer.trim();

		if (!question) {
			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'question-empty',

				message: 'question kosong.'
			});

			continue;
		}

		if (!answer) {
			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'answer-empty',

				message: 'answer kosong.'
			});

			continue;
		}

		const normalizedAnswer = normalizeAnswer(answer);

		if (!normalizedAnswer) {
			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'invalid-answer',

				message: 'answer tidak valid setelah normalisasi.',

				answer
			});

			continue;
		}

		if (importedAnswers.has(normalizedAnswer)) {
			duplicateRowCount += 1;

			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-import',

				message: `answer "${normalizedAnswer}" duplicate di file import.`,

				answer
			});

			continue;
		}

		if (existingAnswers.has(normalizedAnswer)) {
			duplicateRowCount += 1;

			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-existing',

				message: `answer "${normalizedAnswer}" sudah ada di current questions.`,

				answer
			});

			continue;
		}

		importedAnswers.add(normalizedAnswer);

		validRows.push({
			sourceRowNumber: row.sourceRowNumber,

			question,

			answer,

			normalizedAnswer
		});
	}

	const capacity = getCrosswordImportCapacity(currentEntries, mode);

	return {
		totalRowCount: source.rows.length,

		validRows,

		issues,

		validRowCount: validRows.length,

		invalidRowCount: issues.length,

		duplicateRowCount,

		capacity,

		projectedEntryCount: getProjectedEntryCount(currentEntries, validRows.length, mode),

		limitExceeded: validRows.length > capacity
	};
}

/**
 * Menerapkan validated rows ke editor state.
 */
export function applyCrosswordImport(
	currentEntries: CrosswordEntry[],
	importRows: CrosswordImportValidatedRow[],
	mode: CrosswordImportMergeMode
): CrosswordEntry[] {
	const capacity = getCrosswordImportCapacity(currentEntries, mode);

	if (importRows.length > capacity) {
		throw new Error(`Import melebihi limit ${MAX_CROSSWORD_ENTRY_COUNT} questions.`);
	}

	if (mode === 'replace') {
		return importRows.map((row, index) => ({
			id: `entry-${index + 1}`,

			clue: row.question,

			answer: row.answer
		}));
	}

	const nextEntries = currentEntries.map((entry) => ({
		...entry
	}));

	const trailingCount = countTrailingBlankCrosswordEntries(nextEntries);

	let importIndex = 0;

	for (
		let entryIndex = nextEntries.length - trailingCount;
		entryIndex < nextEntries.length && importIndex < importRows.length;
		entryIndex += 1
	) {
		const entry = nextEntries[entryIndex];

		const row = importRows[importIndex];

		if (!entry || !row) {
			continue;
		}

		nextEntries[entryIndex] = {
			...entry,

			clue: row.question,

			answer: row.answer
		};

		importIndex += 1;
	}

	let nextSequence = getNextCrosswordEntrySequence(nextEntries);

	while (importIndex < importRows.length) {
		const row = importRows[importIndex];

		if (!row) {
			break;
		}

		nextEntries.push({
			...createCrosswordEntry(nextSequence),

			clue: row.question,

			answer: row.answer
		});

		nextSequence += 1;

		importIndex += 1;
	}

	return nextEntries;
}
