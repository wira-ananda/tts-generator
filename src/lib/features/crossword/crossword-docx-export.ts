import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

import { createFileTimestamp, triggerBlobDownload } from '$lib/utils/download';

export type CrosswordDocxExportEntry = {
	number: number;
	question: string;
	answer: string;
};

export type CrosswordDocxExportReadiness = {
	ready: boolean;
	reason: string | null;
	entries: CrosswordDocxExportEntry[];
};

export type CrosswordDocxExportResult = {
	fileName: string;
	exportedAt: string;
	exportedCount: number;
};

/**
 * Current editor rows yang benar-benar memiliki content.
 *
 * Fully blank rows sengaja diabaikan karena 10 form awal
 * memang merupakan editor slots, bukan actual questions.
 */
function getActiveCrosswordEntries(entries: CrosswordEntry[]): Array<{
	entry: CrosswordEntry;
	number: number;
}> {
	return entries
		.map((entry, index) => ({
			entry,
			number: index + 1
		}))
		.filter(({ entry }) => {
			return entry.clue.trim() !== '' || entry.answer.trim() !== '';
		});
}

/**
 * Memastikan current questions bisa diexport secara utuh.
 *
 * Export menggunakan current editor state saja,
 * bukan History dan bukan localStorage snapshot.
 */
export function getCrosswordDocxExportReadiness(
	entries: CrosswordEntry[]
): CrosswordDocxExportReadiness {
	const activeEntries = getActiveCrosswordEntries(entries);

	if (activeEntries.length === 0) {
		return {
			ready: false,
			reason: 'Belum ada soal yang dapat diexport.',
			entries: []
		};
	}

	const exportEntries: CrosswordDocxExportEntry[] = [];

	for (const { entry, number } of activeEntries) {
		const question = entry.clue.trim();

		const answer = entry.answer.trim();

		if (!question) {
			return {
				ready: false,
				reason: `Question ${number} belum memiliki soal.`,
				entries: []
			};
		}

		if (!answer) {
			return {
				ready: false,
				reason: `Question ${number} belum memiliki jawaban.`,
				entries: []
			};
		}

		exportEntries.push({
			number,
			question,
			answer
		});
	}

	return {
		ready: true,
		reason: null,
		entries: exportEntries
	};
}

function createCrosswordDocxFileName(): string {
	return `tts-soal-jawaban-${createFileTimestamp(new Date(), { withSeconds: true })}.docx`;
}

/**
 * Download seluruh current Question + Answer menjadi DOCX.
 *
 * Format:
 *
 * 1. Question = Answer
 * 2. Question = Answer
 *
 * Tidak membaca History.
 */
export async function downloadCurrentCrosswordDocx(
	entries: CrosswordEntry[]
): Promise<CrosswordDocxExportResult> {
	/*
	 * Snapshot validation dilakukan sebelum dynamic import.
	 *
	 * String data yang dipakai exporter sudah detached dari
	 * reactive editor state.
	 */
	const readiness = getCrosswordDocxExportReadiness(entries);

	if (!readiness.ready || readiness.entries.length === 0) {
		throw new Error(readiness.reason ?? 'Soal belum siap diexport.');
	}

	/*
	 * DOCX library tidak masuk initial page bundle.
	 * Hanya didownload browser ketika user benar-benar
	 * menjalankan export.
	 */
	const { Document, Packer, Paragraph, TextRun } = await import('docx');

	const paragraphs = readiness.entries.map((item) => {
		return new Paragraph({
			children: [
				new TextRun({
					text: `${item.number}. `,
					font: 'Aptos',
					size: 24
				}),

				new TextRun({
					text: item.question,
					font: 'Aptos',
					size: 24
				}),

				new TextRun({
					text: ' = ',
					font: 'Aptos',
					size: 24
				}),

				new TextRun({
					text: item.answer,
					font: 'Aptos',
					size: 24
				})
			],

			spacing: {
				after: 120,
				line: 360
			}
		});
	});

	const document = new Document({
		sections: [
			{
				properties: {},

				children: paragraphs
			}
		]
	});

	const blob = await Packer.toBlob(document);

	const fileName = createCrosswordDocxFileName();

	triggerBlobDownload(blob, fileName);

	return {
		fileName,

		exportedAt: new Date().toISOString(),

		exportedCount: readiness.entries.length
	};
}
