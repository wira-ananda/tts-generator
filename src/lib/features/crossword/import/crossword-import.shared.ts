import {
	CROSSWORD_IMPORT_MAX_FILE_SIZE_BYTES,
	CROSSWORD_IMPORT_MAX_SOURCE_ROWS
} from '$lib/features/crossword/crossword.constants';

import type {
	CrosswordImportFileType,
	CrosswordImportRawRow
} from '$lib/features/crossword/import/crossword-import.types';

/**
 * Beri UI kesempatan render (mis. spinner) sebelum parsing berat yang memblok thread.
 */
export function waitForBrowserTurn(): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, 0);
	});
}

export function assertCrosswordImportFileSize(file: File): void {
	if (file.size > CROSSWORD_IMPORT_MAX_FILE_SIZE_BYTES) {
		throw new Error('File terlalu besar. Maksimal ukuran import adalah 5 MB.');
	}
}

export function getFileExtension(fileName: string): string {
	const dotIndex = fileName.lastIndexOf('.');

	if (dotIndex === -1 || dotIndex === fileName.length - 1) {
		return '';
	}

	return fileName.slice(dotIndex + 1).toLowerCase();
}

export function getCrosswordImportFileType(fileName: string): CrosswordImportFileType {
	const extension = getFileExtension(fileName);

	if (extension === 'csv') {
		return 'csv';
	}

	if (extension === 'xlsx') {
		return 'xlsx';
	}

	if (extension === 'docx') {
		return 'docx';
	}

	if (extension === 'doc') {
		throw new Error(
			'Format .doc lama belum didukung. Simpan dokumen sebagai .docx terlebih dahulu.'
		);
	}

	throw new Error('Format file tidak didukung. Gunakan .csv, .xlsx, atau .docx.');
}

export function toImportCellText(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}

	return String(value).trim();
}

export function normalizeImportHeader(value: unknown): string {
	return String(value ?? '')
		.replace(/^\uFEFF/, '')
		.trim()
		.toLowerCase();
}

function isTableRowEmpty(row: unknown[]): boolean {
	return row.every((value) => toImportCellText(value) === '');
}

export function extractCrosswordImportRowsFromTable(table: unknown[][]): CrosswordImportRawRow[] {
	if (table.length === 0) {
		throw new Error('File tidak memiliki data.');
	}

	const headerRow = table[0] ?? [];

	const headers = headerRow.map(normalizeImportHeader);

	const questionColumn = headers.indexOf('question');

	const answerColumn = headers.indexOf('answer');

	if (questionColumn === -1 || answerColumn === -1) {
		throw new Error(
			'Header tidak valid. Baris pertama wajib memiliki kolom "question" dan "answer".'
		);
	}

	const rows: CrosswordImportRawRow[] = [];

	for (let index = 1; index < table.length; index += 1) {
		const tableRow = table[index] ?? [];

		if (isTableRowEmpty(tableRow)) {
			continue;
		}

		rows.push({
			sourceRowNumber: index + 1,

			question: toImportCellText(tableRow[questionColumn]),

			answer: toImportCellText(tableRow[answerColumn])
		});

		if (rows.length > CROSSWORD_IMPORT_MAX_SOURCE_ROWS) {
			throw new Error(`Maksimal ${CROSSWORD_IMPORT_MAX_SOURCE_ROWS} source rows dapat diproses.`);
		}
	}

	if (rows.length === 0) {
		throw new Error('Tidak ditemukan data setelah header.');
	}

	return rows;
}
