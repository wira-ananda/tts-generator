export type CrosswordDownloadState = 'never' | 'current' | 'stale';

/**
 * Mode download PDF:
 *
 * - 'complete': TTS kosong + Daftar Soal + Kunci Jawaban (satu PDF penuh).
 * - 'puzzle-and-questions': TTS kosong + Daftar Soal saja (tanpa Kunci Jawaban).
 * - 'puzzle-only': TTS kosong saja (satu halaman grid kosong, tanpa Daftar Soal
 *   dan tanpa Kunci Jawaban).
 */
export type CrosswordPdfMode = 'complete' | 'puzzle-and-questions' | 'puzzle-only';

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
