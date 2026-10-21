import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { generateCrosswordPdfBytes } from '$lib/features/crossword/crossword-export.pdf';

import type { CrosswordPdfMode } from '$lib/features/crossword/crossword-export.types';

import { buildCrosswordLayout } from '$lib/features/crossword/crossword-generator';

import { CROSSWORD_PDF_MODES } from '$lib/features/crossword/crossword-pdf-modes';

const entries = ['laravel', 'react', 'svelte', 'vite', 'python'].map((answer, index) => ({
	id: `entry-${index + 1}`,
	clue: `Clue ${index + 1}`,
	answer
}));

const EXPECTED_SIZES = {
	'a4-portrait': [595.28, 841.89],
	'a3-landscape': [1190.55, 841.89],
	'a3-portrait': [841.89, 1190.55]
};

describe('crossword pdf modes', () => {
	for (const mode of Object.keys(CROSSWORD_PDF_MODES) as CrosswordPdfMode[]) {
		it(`renders the configured pages for ${mode}`, async () => {
			const config = CROSSWORD_PDF_MODES[mode];

			const layout = buildCrosswordLayout(entries, { layoutMode: config.layoutMode });

			const bytes = await generateCrosswordPdfBytes(entries, layout, 'Judul', mode);

			const pdf = await PDFDocument.load(bytes);

			const pageSizes = pdf.getPages().map((page) => {
				const { width, height } = page.getSize();

				return [Number(width.toFixed(2)), Number(height.toFixed(2))];
			});

			expect(pageSizes).toEqual(config.pages.map((page) => EXPECTED_SIZES[page.size]));
		});
	}
});
