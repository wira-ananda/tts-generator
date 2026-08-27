import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

export type CrosswordImportFileType = 'csv' | 'xlsx' | 'docx';

export type CrosswordImportMergeMode = 'append' | 'replace';

export type CrosswordImportIssueCode =
	'question-empty' | 'answer-empty' | 'invalid-answer' | 'duplicate-import' | 'duplicate-existing';

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

export type CrosswordImportValidation = {
	totalRowCount: number;

	validRows: CrosswordImportValidatedRow[];

	issues: CrosswordImportIssue[];

	validRowCount: number;

	invalidRowCount: number;

	duplicateRowCount: number;

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
