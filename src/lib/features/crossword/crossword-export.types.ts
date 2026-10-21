export type CrosswordPdfMode =
	| 'complete'
	| 'puzzle-and-questions'
	| 'puzzle-only'
	| 'puzzle-first-letters'
	| 'questions-only'
	| 'answer-key-only'
	| 'questions-only-a3'
	| 'complete-part-2'
	| 'complete-part-3'
	| 'puzzle-and-questions-a3'
	| 'puzzle-first-letters-a3';

export type CrosswordDownloadState = 'never' | 'current' | 'stale';

export type CrosswordDownloadMeta = {
	version: 1;
	signature: string;
	downloadedAt: string;
	fileName: string;
};

export type CrosswordExportReadiness = {
	ready: boolean;
	reason: string | null;
	activeEntryCount: number;
};

export type CrosswordPdfResult = {
	fileName: string;
	downloadedAt: string;
};
