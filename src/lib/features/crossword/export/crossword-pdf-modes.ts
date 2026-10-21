import type { CrosswordPdfMode } from '$lib/features/crossword/export/crossword-export.types';

import type { CrosswordLayoutMode } from '$lib/features/crossword/crossword.types';

export type CrosswordPdfPageSize = 'a4-portrait' | 'a3-landscape' | 'a3-portrait';

/**
 * - 'none': semua cell kosong (TTS Kosong).
 * - 'first-letters': hanya cell bernomor yang diisi huruf (TTS Awalan).
 * - 'all': semua cell diisi huruf (Kunci Jawaban).
 */
export type CrosswordGridLetterReveal = 'none' | 'first-letters' | 'all';

export type CrosswordPdfPage =
	| { kind: 'grid'; reveal: CrosswordGridLetterReveal; size: CrosswordPdfPageSize }
	| { kind: 'questions'; size: CrosswordPdfPageSize };

export type CrosswordPdfModeConfig = {
	label: string;
	layoutMode: CrosswordLayoutMode;
	pages: CrosswordPdfPage[];
	/** Ditempel setelah judul TTS; 'complete' kosong agar nama file = judul. */
	fileNameSuffix: string;
	/** Dipakai bila judul kosong, setelah `tts-<timestamp>`. */
	timestampSuffix: string;
};

const blankGrid = (size: CrosswordPdfPageSize): CrosswordPdfPage => ({
	kind: 'grid',
	reveal: 'none',
	size
});

const firstLettersGrid = (size: CrosswordPdfPageSize): CrosswordPdfPage => ({
	kind: 'grid',
	reveal: 'first-letters',
	size
});

const answerKeyGrid = (size: CrosswordPdfPageSize): CrosswordPdfPage => ({
	kind: 'grid',
	reveal: 'all',
	size
});

const questions = (size: CrosswordPdfPageSize): CrosswordPdfPage => ({
	kind: 'questions',
	size
});

/**
 * Urutan key = urutan opsi di toolbar.
 */
export const CROSSWORD_PDF_MODES: Record<CrosswordPdfMode, CrosswordPdfModeConfig> = {
	complete: {
		label: 'PDF Lengkap (TTS + Soal + Kunci)',
		layoutMode: 'landscape',
		pages: [blankGrid('a3-landscape'), questions('a4-portrait'), answerKeyGrid('a3-landscape')],
		fileNameSuffix: '',
		timestampSuffix: ''
	},
	'complete-part-2': {
		label: 'Lengkap Part 2 (A3+ Portrait: TTS Awalan + Soal)',
		layoutMode: 'portrait',
		pages: [firstLettersGrid('a3-portrait'), questions('a3-portrait')],
		fileNameSuffix: ' - Lengkap Part 2',
		timestampSuffix: '-lengkap-part-2'
	},
	'complete-part-3': {
		label: 'Lengkap Part 3 (A3+ Portrait: TTS Awalan + Soal + TTS Kosong)',
		layoutMode: 'portrait',
		pages: [firstLettersGrid('a3-portrait'), questions('a3-portrait'), blankGrid('a3-portrait')],
		fileNameSuffix: ' - Lengkap Part 3',
		timestampSuffix: '-lengkap-part-3'
	},
	'questions-only-a3': {
		label: 'Soal saja (A3+ Portrait)',
		layoutMode: 'portrait',
		pages: [questions('a3-portrait')],
		fileNameSuffix: ' - Soal A3',
		timestampSuffix: '-soal-a3'
	},
	'puzzle-first-letters': {
		label: 'TTS Awalan (huruf pertama)',
		layoutMode: 'landscape',
		pages: [firstLettersGrid('a3-landscape')],
		fileNameSuffix: ' - TTS Awalan',
		timestampSuffix: '-tts-awalan'
	},
	'puzzle-only': {
		label: 'TTS Kosong saja',
		layoutMode: 'landscape',
		pages: [blankGrid('a3-landscape')],
		fileNameSuffix: ' - TTS Kosong',
		timestampSuffix: '-tts-kosong'
	},
	'puzzle-and-questions': {
		label: 'TTS Kosong + Soal',
		layoutMode: 'landscape',
		pages: [blankGrid('a3-landscape'), questions('a4-portrait')],
		fileNameSuffix: ' - TTS & Soal',
		timestampSuffix: '-tts-soal'
	},
	'questions-only': {
		label: 'Soal saja',
		layoutMode: 'landscape',
		pages: [questions('a4-portrait')],
		fileNameSuffix: ' - Soal',
		timestampSuffix: '-soal'
	},
	'answer-key-only': {
		label: 'Kunci Jawaban saja',
		layoutMode: 'landscape',
		pages: [answerKeyGrid('a3-landscape')],
		fileNameSuffix: ' - Kunci Jawaban',
		timestampSuffix: '-kunci-jawaban'
	},
	'puzzle-and-questions-a3': {
		label: 'Soal + TTS Kosong (A3 Portrait)',
		layoutMode: 'portrait',
		pages: [questions('a3-portrait'), blankGrid('a3-portrait')],
		fileNameSuffix: ' - Soal + TTS Kosong A3',
		timestampSuffix: '-soal-tts-kosong-a3'
	},
	'puzzle-first-letters-a3': {
		label: 'TTS Awalan saja (A3+ Portrait)',
		layoutMode: 'portrait',
		pages: [firstLettersGrid('a3-portrait')],
		fileNameSuffix: ' - TTS Awalan A3+',
		timestampSuffix: '-tts-awalan-a3-plus'
	}
};

export const CROSSWORD_PDF_MODE_OPTIONS = (
	Object.entries(CROSSWORD_PDF_MODES) as [CrosswordPdfMode, CrosswordPdfModeConfig][]
).map(([value, config]) => ({ value, label: config.label }));
