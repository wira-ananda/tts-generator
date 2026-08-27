import { CROSSWORD_IMPORT_MAX_SOURCE_ROWS } from '$lib/features/crossword/crossword.constants';

import type { CrosswordImportSource } from '$lib/features/crossword/crossword-import.types';

import { extractCrosswordImportRowsFromTable } from '$lib/features/crossword/import/crossword-import.shared';

type CsvParseResult = {
	rows: string[][];
	truncated: boolean;
};

function parseCsvRows(text: string, maxRows: number): CsvParseResult {
	const rows: string[][] = [];

	let currentRow: string[] = [];

	let currentField = '';

	let insideQuotes = false;

	let index = 0;

	function commitField(): void {
		currentRow.push(currentField);

		currentField = '';
	}

	function commitRow(): boolean {
		commitField();

		rows.push(currentRow);

		currentRow = [];

		return rows.length >= maxRows;
	}

	while (index < text.length) {
		const character = text.charAt(index);

		if (character === '"') {
			const nextCharacter = text.charAt(index + 1);

			if (insideQuotes && nextCharacter === '"') {
				currentField += '"';

				index += 2;

				continue;
			}

			insideQuotes = !insideQuotes;

			index += 1;

			continue;
		}

		if (character === ',' && !insideQuotes) {
			commitField();

			index += 1;

			continue;
		}

		if ((character === '\n' || character === '\r') && !insideQuotes) {
			const reachedLimit = commitRow();

			if (character === '\r' && text.charAt(index + 1) === '\n') {
				index += 2;
			} else {
				index += 1;
			}

			if (reachedLimit) {
				return {
					rows,

					truncated: text.slice(index).trim() !== ''
				};
			}

			continue;
		}

		currentField += character;

		index += 1;
	}

	if (insideQuotes) {
		throw new Error('CSV tidak valid: quoted value tidak ditutup.');
	}

	if (currentField !== '' || currentRow.length > 0) {
		commitRow();
	}

	return {
		rows,
		truncated: false
	};
}

/**
 * Parse CSV text menjadi source importer.
 */
export function parseCrosswordCsvText(
	text: string,
	fileName = 'import.csv'
): CrosswordImportSource {
	const result = parseCsvRows(text, CROSSWORD_IMPORT_MAX_SOURCE_ROWS + 2);

	if (result.truncated) {
		throw new Error(`Maksimal ${CROSSWORD_IMPORT_MAX_SOURCE_ROWS} source rows dapat diproses.`);
	}

	return {
		fileName,

		fileType: 'csv',

		rows: extractCrosswordImportRowsFromTable(result.rows)
	};
}

/**
 * Membaca CSV File dari browser.
 */
export async function parseCrosswordCsvFile(file: File): Promise<CrosswordImportSource> {
	const text = await file.text();

	return parseCrosswordCsvText(text, file.name);
}
