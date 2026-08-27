import { CROSSWORD_IMPORT_MAX_SOURCE_ROWS } from '$lib/features/crossword/crossword.constants';

import type { CrosswordImportSource } from '$lib/features/crossword/crossword-import.types';

import { extractCrosswordImportRowsFromTable } from '$lib/features/crossword/import/crossword-import.shared';

/**
 * XLSX parser dimuat secara dynamic agar tidak menambah initial bundle.
 */
export async function parseCrosswordXlsxFile(file: File): Promise<CrosswordImportSource> {
	const XLSX = await import('xlsx');

	const arrayBuffer = await file.arrayBuffer();

	const workbook = XLSX.read(arrayBuffer, {
		type: 'array',

		sheetRows: CROSSWORD_IMPORT_MAX_SOURCE_ROWS + 2
	});

	const firstSheetName = workbook.SheetNames[0];

	if (!firstSheetName) {
		throw new Error('Workbook tidak memiliki worksheet.');
	}

	const worksheet = workbook.Sheets[firstSheetName];

	if (!worksheet) {
		throw new Error('Worksheet pertama tidak dapat dibaca.');
	}

	const table = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,

		raw: false,

		defval: '',

		blankrows: false
	}) as unknown[][];

	if (table.length > CROSSWORD_IMPORT_MAX_SOURCE_ROWS + 1) {
		throw new Error(`Maksimal ${CROSSWORD_IMPORT_MAX_SOURCE_ROWS} source rows dapat diproses.`);
	}

	return {
		fileName: file.name,

		fileType: 'xlsx',

		rows: extractCrosswordImportRowsFromTable(table)
	};
}
