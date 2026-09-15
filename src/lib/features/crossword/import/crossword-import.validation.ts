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
 * Normalisasi question supaya perbandingan "soal sama persis"
 * tidak sensitif terhadap case atau spasi berlebih.
 *
 * Ini sengaja tidak sekuat normalizeAnswer (tidak strip tanda baca)
 * karena tujuannya cuma mendeteksi row yang benar-benar copy-paste
 * duplicate, bukan fuzzy-matching soal yang mirip.
 */
function normalizeQuestionForComparison(question: string): string {
	return question.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Key row dianggap "duplicate row asli" hanya kalau soal DAN
 * answer-nya sama persis dengan row lain.
 */
function buildDuplicateRowKey(normalizedAnswer: string, normalizedQuestion: string): string {
	return `${normalizedAnswer}::${normalizedQuestion}`;
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

	const warnings: CrosswordImportValidation['warnings'] = [];

	const importedAnswers = new Set<string>();

	const importedRowKeys = new Set<string>();

	const existingAnswers = new Set<string>();

	const existingRowKeys = new Set<string>();

	if (mode === 'append') {
		for (const entry of currentEntries) {
			const answer = normalizeAnswer(entry.answer);

			if (!answer) {
				continue;
			}

			existingAnswers.add(answer);

			existingRowKeys.add(buildDuplicateRowKey(answer, normalizeQuestionForComparison(entry.clue)));
		}
	}

	let duplicateRowCount = 0;

	let duplicateAnswerWarningCount = 0;

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

		const normalizedQuestion = normalizeQuestionForComparison(question);

		const rowKey = buildDuplicateRowKey(normalizedAnswer, normalizedQuestion);

		/**
		 * Row dianggap duplicate row asli (invalid, tidak diimport)
		 * hanya kalau soal DAN answer-nya sama persis dengan row lain.
		 *
		 * Answer yang sama tapi soal berbeda TETAP diimport — cukup
		 * diberi warning, karena itu bukan copy-paste duplicate,
		 * hanya kebetulan dua soal berbeda punya jawaban yang sama.
		 */
		if (importedRowKeys.has(rowKey)) {
			duplicateRowCount += 1;

			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-import',

				message: `soal dan answer "${normalizedAnswer}" ini duplicate persis dengan row lain di file import.`,

				answer
			});

			continue;
		}

		if (existingRowKeys.has(rowKey)) {
			duplicateRowCount += 1;

			issues.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-existing',

				message: `soal dan answer "${normalizedAnswer}" ini sudah ada persis sama di current questions.`,

				answer
			});

			continue;
		}

		if (importedAnswers.has(normalizedAnswer)) {
			duplicateAnswerWarningCount += 1;

			warnings.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-answer-import',

				message: `answer "${normalizedAnswer}" sama dengan row lain di file import (soal berbeda). Tetap diimport.`,

				answer
			});
		} else if (existingAnswers.has(normalizedAnswer)) {
			duplicateAnswerWarningCount += 1;

			warnings.push({
				rowNumber: row.sourceRowNumber,

				code: 'duplicate-answer-existing',

				message: `answer "${normalizedAnswer}" sudah dipakai current questions (soal berbeda). Tetap diimport.`,

				answer
			});
		}

		importedAnswers.add(normalizedAnswer);

		importedRowKeys.add(rowKey);

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

		warnings,

		validRowCount: validRows.length,

		invalidRowCount: issues.length,

		duplicateRowCount,

		duplicateAnswerWarningCount,

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
