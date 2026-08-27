import { CROSSWORD_IMPORT_MAX_SOURCE_ROWS } from '$lib/features/crossword/crossword.constants';

import type {
	CrosswordImportRawRow,
	CrosswordImportSource
} from '$lib/features/crossword/crossword-import.types';

type MammothModule = {
	extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{
		value: string;
	}>;
};

function stripWordQuestionNumber(value: string): {
	content: string;
	explicitNumber: number | null;
} {
	const match = value.match(/^\s*(\d+)\s*[.)]\s*(.+)$/);

	if (!match) {
		return {
			content: value.trim(),

			explicitNumber: null
		};
	}

	const number = Number(match[1]);

	return {
		content: match[2]?.trim() ?? '',

		explicitNumber: Number.isFinite(number) ? number : null
	};
}

/**
 * Parse satu baris Word dengan format:
 *
 * 1. Pertanyaan = Jawaban
 *
 * Penomoran boleh berasal dari Word automatic numbering
 * atau ditulis manual.
 */
function parseWordQuestionLine(line: string, fallbackNumber: number): CrosswordImportRawRow {
	const { content, explicitNumber } = stripWordQuestionNumber(line);

	const separatorIndex = content.indexOf('=');

	if (separatorIndex === -1) {
		return {
			sourceRowNumber: explicitNumber ?? fallbackNumber,

			question: content,

			answer: ''
		};
	}

	return {
		sourceRowNumber: explicitNumber ?? fallbackNumber,

		question: content.slice(0, separatorIndex).trim(),

		answer: content.slice(separatorIndex + 1).trim()
	};
}

/**
 * Pure parser untuk text yang sudah diekstrak dari DOCX.
 */
export function parseCrosswordWordText(
	text: string,
	fileName = 'import.docx'
): CrosswordImportSource {
	const lines = text
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) {
		throw new Error('Dokumen Word tidak memiliki data.');
	}

	if (lines.length > CROSSWORD_IMPORT_MAX_SOURCE_ROWS) {
		throw new Error(`Maksimal ${CROSSWORD_IMPORT_MAX_SOURCE_ROWS} source rows dapat diproses.`);
	}

	return {
		fileName,

		fileType: 'docx',

		rows: lines.map((line, index) => parseWordQuestionLine(line, index + 1))
	};
}

/**
 * Membaca raw text DOCX menggunakan Mammoth.
 *
 * Hasil Word tidak dirender sebagai HTML.
 */
export async function parseCrosswordDocxFile(file: File): Promise<CrosswordImportSource> {
	const importedModule = (await import('mammoth')) as unknown as MammothModule & {
		default?: MammothModule;
	};

	const mammoth = importedModule.default ?? importedModule;

	const arrayBuffer = await file.arrayBuffer();

	const result = await mammoth.extractRawText({
		arrayBuffer
	});

	return parseCrosswordWordText(result.value, file.name);
}
