import { describe, expect, it } from 'vitest';

import {
	createCrosswordExportSignature,
	getCrosswordDownloadState,
	getCrosswordExportReadiness
} from '$lib/features/crossword/crossword-export';

import { buildCrosswordLayout } from '$lib/features/crossword/crossword-generator';

import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

describe('crossword export', () => {
	const entries: CrosswordEntry[] = [
		{
			id: 'entry-1',

			clue: 'Hewan berkaki empat',

			answer: 'Kucing'
		}
	];

	it('is ready when all active entries are placed', () => {
		const layout = buildCrosswordLayout(entries);

		expect(getCrosswordExportReadiness(entries, layout).ready).toBe(true);
	});

	it('detects content changes after download', () => {
		const layout = buildCrosswordLayout(entries);

		const signature = createCrosswordExportSignature(entries, layout);

		expect(
			getCrosswordDownloadState(
				{
					version: 1,

					signature,

					downloadedAt: '2026-08-28T00:00:00.000Z',

					fileName: 'test.pdf'
				},
				signature
			)
		).toBe('current');

		expect(
			getCrosswordDownloadState(
				{
					version: 1,

					signature: 'old',

					downloadedAt: '2026-08-28T00:00:00.000Z',

					fileName: 'test.pdf'
				},
				signature
			)
		).toBe('stale');
	});
});
