import { browser } from '$app/environment';

import type {
	CrosswordDownloadMeta,
	CrosswordDownloadState,
	CrosswordExportReadiness
} from '$lib/features/crossword/crossword-export.types';

import type { CrosswordEntry, CrosswordLayout } from '$lib/features/crossword/crossword.types';

import { normalizeAnswer } from '$lib/features/crossword/crossword.utils';

const DOWNLOAD_STORAGE_KEY = 'tts-generator:download:v1';

/**
 * Signature berubah jika content atau layout PDF berubah.
 */
export function createCrosswordExportSignature(
	entries: CrosswordEntry[],
	layout: CrosswordLayout
): string {
	return JSON.stringify({
		entries: entries.map((entry, index) => ({
			number: index + 1,

			clue: entry.clue.trim(),

			answer: entry.answer.trim()
		})),

		placements: layout.placements
			.map((placement) => ({
				entryId: placement.entryId,

				number: placement.number,

				x: placement.x,

				y: placement.y,

				direction: placement.direction,

				answer: placement.answer
			}))
			.sort((first, second) => first.number - second.number),

		width: layout.width,

		height: layout.height
	});
}

/**
 * Memastikan PDF tidak dibuat dari crossword yang belum lengkap.
 */
export function getCrosswordExportReadiness(
	entries: CrosswordEntry[],
	layout: CrosswordLayout
): CrosswordExportReadiness {
	const activeEntries = entries.filter(
		(entry) => entry.clue.trim() !== '' || entry.answer.trim() !== ''
	);

	if (activeEntries.length === 0) {
		return {
			ready: false,

			reason: 'Isi minimal satu soal dan jawaban terlebih dahulu.',

			activeEntryCount: 0
		};
	}

	for (const [index, entry] of activeEntries.entries()) {
		if (!entry.clue.trim()) {
			return {
				ready: false,

				reason: `Question ${index + 1} belum memiliki soal.`,

				activeEntryCount: activeEntries.length
			};
		}

		if (!normalizeAnswer(entry.answer)) {
			return {
				ready: false,

				reason: `Question ${index + 1} belum memiliki jawaban valid.`,

				activeEntryCount: activeEntries.length
			};
		}
	}

	if (layout.unplacedEntries.length > 0) {
		return {
			ready: false,

			reason: 'Selesaikan semua unplaced answers sebelum download.',

			activeEntryCount: activeEntries.length
		};
	}

	if (layout.placements.length !== activeEntries.length) {
		return {
			ready: false,

			reason: 'Crossword belum selesai digenerate.',

			activeEntryCount: activeEntries.length
		};
	}

	return {
		ready: true,

		reason: null,

		activeEntryCount: activeEntries.length
	};
}

/**
 * Membaca metadata download terakhir.
 */
export function readCrosswordDownloadMeta(): CrosswordDownloadMeta | null {
	if (!browser) {
		return null;
	}

	try {
		const raw = window.localStorage.getItem(DOWNLOAD_STORAGE_KEY);

		if (!raw) {
			return null;
		}

		const parsed = JSON.parse(raw) as Partial<CrosswordDownloadMeta>;

		if (
			parsed.version !== 1 ||
			typeof parsed.signature !== 'string' ||
			typeof parsed.downloadedAt !== 'string' ||
			typeof parsed.fileName !== 'string'
		) {
			return null;
		}

		return {
			version: 1,

			signature: parsed.signature,

			downloadedAt: parsed.downloadedAt,

			fileName: parsed.fileName
		};
	} catch {
		return null;
	}
}

/**
 * Menyimpan metadata successful download.
 */
export function saveCrosswordDownloadMeta(meta: CrosswordDownloadMeta): boolean {
	if (!browser) {
		return false;
	}

	try {
		window.localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(meta));

		return true;
	} catch {
		return false;
	}
}

/**
 * Menentukan status download terhadap state sekarang.
 */
export function getCrosswordDownloadState(
	meta: CrosswordDownloadMeta | null,
	currentSignature: string
): CrosswordDownloadState {
	if (!meta) {
		return 'never';
	}

	if (meta.signature === currentSignature) {
		return 'current';
	}

	return 'stale';
}
