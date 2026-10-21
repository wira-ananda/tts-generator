import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CROSSWORD_AUTOSAVE_DELAY_MS,
	CROSSWORD_GENERATION_DELAY_MS
} from '$lib/features/crossword/crossword.constants';

import {
	readCrosswordDraft,
	readCrosswordHistory,
	saveCrosswordDraft
} from '$lib/features/crossword/crossword.persistence';

import { CrosswordSession } from '$lib/features/crossword/crossword-session.svelte';

import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

import { downloadCrosswordPdf } from '$lib/features/crossword/export/crossword-export.pdf';

vi.mock('$lib/features/crossword/export/crossword-export.pdf', () => ({
	downloadCrosswordPdf: vi.fn()
}));

function entriesOf(...pairs: [clue: string, answer: string][]): CrosswordEntry[] {
	return pairs.map(([clue, answer], index) => ({ id: `entry-${index + 1}`, clue, answer }));
}

function createRestoredSession(): CrosswordSession {
	const session = new CrosswordSession();

	session.restore();

	return session;
}

beforeEach(() => {
	vi.useFakeTimers();
	localStorage.clear();
	vi.mocked(downloadCrosswordPdf).mockReset();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('CrosswordSession generation', () => {
	it('generates the layout after the debounce delay', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel'], ['UI', 'react']));

		expect(session.isGenerating).toBe(true);
		expect(session.layout.placements).toHaveLength(0);

		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		expect(session.isGenerating).toBe(false);
		expect(session.layout.placements).toHaveLength(2);
	});

	it('does not regenerate when only a clue changes', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel'], ['UI', 'react']));
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		const layoutBefore = session.layout;

		session.setEntries(entriesOf(['Framework PHP', 'laravel'], ['UI', 'react']));

		expect(session.isGenerating).toBe(false);
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);
		expect(session.layout).toBe(layoutBefore);
	});

	it('only applies the latest of several rapid changes', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel']));
		session.setEntries(entriesOf(['PHP', 'laravel'], ['UI', 'react'], ['Compiler', 'svelte']));
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		expect(session.layout.placements.map((placement) => placement.answer).sort()).toEqual([
			'LARAVEL',
			'REACT',
			'SVELTE'
		]);
	});

	it('resets to an empty layout when no answers remain', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel']));
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		session.setEntries(entriesOf(['PHP', '']));

		expect(session.isGenerating).toBe(false);
		expect(session.layout.placements).toHaveLength(0);
	});

	it('regenerates immediately when the PDF mode changes', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel'], ['UI', 'react']));
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		const layoutBefore = session.layout;

		session.setPdfMode('complete-part-2');
		vi.advanceTimersByTime(0);

		expect(session.pdfMode).toBe('complete-part-2');
		expect(session.layout).not.toBe(layoutBefore);
	});
});

describe('CrosswordSession persistence', () => {
	it('does not autosave before restore() has run', () => {
		const session = new CrosswordSession();

		session.setTitle('Belum siap');
		vi.advanceTimersByTime(CROSSWORD_AUTOSAVE_DELAY_MS);

		expect(session.saveStatus).toBe('idle');
		expect(readCrosswordDraft()).toBeNull();
	});

	it('autosaves the draft after the debounce delay', () => {
		const session = createRestoredSession();

		session.setTitle('Judul Uji');

		expect(session.saveStatus).toBe('saving');

		vi.advanceTimersByTime(CROSSWORD_AUTOSAVE_DELAY_MS);

		expect(session.saveStatus).toBe('saved');
		expect(readCrosswordDraft()?.title).toBe('Judul Uji');
	});

	it('restores the stored draft and generates its layout', () => {
		saveCrosswordDraft(entriesOf(['PHP', 'laravel'], ['UI', 'react']), 'Tersimpan');

		const session = createRestoredSession();

		expect(session.title).toBe('Tersimpan');
		expect(session.saveStatus).toBe('saved');
		expect(session.entries.map((entry) => entry.answer)).toEqual(['laravel', 'react']);

		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		expect(session.layout.placements).toHaveLength(2);
	});

	it('snapshots current entries and drops pending autosave on import', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel']));

		session.importEntries({
			entries: entriesOf(['UI', 'react']),
			mode: 'replace',
			fileName: 'soal.csv',
			importedCount: 1
		});

		vi.advanceTimersByTime(CROSSWORD_AUTOSAVE_DELAY_MS + CROSSWORD_GENERATION_DELAY_MS);

		expect(readCrosswordDraft()?.entries.map((entry) => entry.answer)).toEqual(['react']);
		expect(session.historyItems[0]?.label).toBe('Before import: soal.csv');
		expect(readCrosswordHistory()[0]?.entries.map((entry) => entry.answer)).toEqual(['laravel']);
		expect(session.layout.placements.map((placement) => placement.answer)).toEqual(['REACT']);
	});

	it('restores a history item', () => {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel']));
		session.saveVersion();

		session.setEntries(entriesOf(['PHP', 'python']));
		session.restoreHistory(session.historyItems[0]);

		expect(session.entries.map((entry) => entry.answer)).toEqual(['laravel']);
		expect(session.historyItems.map((item) => item.label)).toEqual([
			'Before restore',
			'Manual version'
		]);
	});
});

describe('CrosswordSession download', () => {
	function createReadySession(): CrosswordSession {
		const session = createRestoredSession();

		session.setEntries(entriesOf(['PHP', 'laravel'], ['UI', 'react']));
		vi.advanceTimersByTime(CROSSWORD_GENERATION_DELAY_MS);

		return session;
	}

	it('marks the download as current, then stale after an edit', async () => {
		vi.mocked(downloadCrosswordPdf).mockResolvedValue({
			fileName: 'tts.pdf',
			downloadedAt: '2026-10-21T00:00:00.000Z'
		});

		const session = createReadySession();

		expect(session.exportReadiness.ready).toBe(true);
		expect(session.downloadState).toBe('never');

		await session.downloadPdf();

		expect(session.downloadState).toBe('current');
		expect(session.isDownloading).toBe(false);

		session.setEntries(entriesOf(['Framework PHP', 'laravel'], ['UI', 'react']));

		expect(session.downloadState).toBe('stale');
	});

	it('exposes an error message when PDF generation fails', async () => {
		vi.mocked(downloadCrosswordPdf).mockRejectedValue(new Error('boom'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const session = createReadySession();

		await session.downloadPdf();

		expect(session.downloadError).not.toBeNull();
		expect(session.isDownloading).toBe(false);
		expect(session.downloadState).toBe('never');
	});
});
