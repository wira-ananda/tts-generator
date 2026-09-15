import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

export type CrosswordImportFileType = 'csv' | 'xlsx' | 'docx';

export type CrosswordImportMergeMode = 'append' | 'replace';

export type CrosswordImportIssueCode =
	'question-empty' | 'answer-empty' | 'invalid-answer' | 'duplicate-import' | 'duplicate-existing';

/**
 * Warning tidak menggagalkan import — row tetap masuk ke validRows.
 *
 * Dipakai untuk kasus answer yang sama tapi soal-nya berbeda, karena
 * itu bukan duplicate row yang sesungguhnya (lihat CrosswordImportIssueCode
 * untuk duplicate row asli: soal DAN answer sama persis).
 */
export type CrosswordImportWarningCode = 'duplicate-answer-import' | 'duplicate-answer-existing';

export type CrosswordImportRawRow = {
	sourceRowNumber: number;
	question: string;
	answer: string;
};

export type CrosswordImportSource = {
	fileName: string;
	fileType: CrosswordImportFileType;
	rows: CrosswordImportRawRow[];
};

export type CrosswordImportValidatedRow = {
	sourceRowNumber: number;

	question: string;

	answer: string;

	normalizedAnswer: string;
};

export type CrosswordImportIssue = {
	rowNumber: number;

	code: CrosswordImportIssueCode;

	message: string;

	answer?: string;
};

export type CrosswordImportWarning = {
	rowNumber: number;

	code: CrosswordImportWarningCode;

	message: string;

	answer?: string;
};

export type CrosswordImportValidation = {
	totalRowCount: number;

	validRows: CrosswordImportValidatedRow[];

	issues: CrosswordImportIssue[];

	warnings: CrosswordImportWarning[];

	validRowCount: number;

	invalidRowCount: number;

	duplicateRowCount: number;

	duplicateAnswerWarningCount: number;

	capacity: number;

	projectedEntryCount: number;

	limitExceeded: boolean;
};

export type CrosswordImportCommit = {
	entries: CrosswordEntry[];

	mode: CrosswordImportMergeMode;

	fileName: string;

	importedCount: number;
};
