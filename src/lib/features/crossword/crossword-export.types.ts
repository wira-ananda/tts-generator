import type { CrosswordPdfResult } from '$lib/features/crossword/crossword-export.types';

export type CrosswordPdfMode =
	| 'complete'
	| 'puzzle-and-questions'
	| 'puzzle-only'
	| 'puzzle-first-letters'
	| 'questions-only'
	| 'answer-key-only'
	| 'questions-only-a3'
	| 'complete-part-2'
	| 'complete-part-3';

export type CrosswordDownloadState = 'never' | 'downloaded' | 'stale';

export type { CrosswordPdfResult };
