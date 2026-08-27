import type { CrosswordImportSource } from '$lib/features/crossword/crossword-import.types';

import { parseCrosswordCsvFile } from '$lib/features/crossword/import/crossword-import.csv';

import { parseCrosswordDocxFile } from '$lib/features/crossword/import/crossword-import.docx';

import {
	assertCrosswordImportFileSize,
	getCrosswordImportFileType,
	waitForBrowserTurn
} from '$lib/features/crossword/import/crossword-import.shared';

import { parseCrosswordXlsxFile } from '$lib/features/crossword/import/crossword-import.xlsx';

/**
 * Memilih parser sesuai format file.
 */
export async function parseCrosswordImportFile(file: File): Promise<CrosswordImportSource> {
	assertCrosswordImportFileSize(file);

	const fileType = getCrosswordImportFileType(file.name);

	await waitForBrowserTurn();

	switch (fileType) {
		case 'csv':
			return parseCrosswordCsvFile(file);

		case 'xlsx':
			return parseCrosswordXlsxFile(file);

		case 'docx':
			return parseCrosswordDocxFile(file);
	}
}
