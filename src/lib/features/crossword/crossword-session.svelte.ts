import {
	CROSSWORD_AUTOSAVE_DELAY_MS,
	CROSSWORD_GENERATION_DELAY_MS,
	CROSSWORD_LIVE_ATTEMPTS
} from '$lib/features/crossword/crossword.constants';

import {
	createCrosswordExportSignature,
	getCrosswordDownloadState,
	getCrosswordExportReadiness,
	readCrosswordDownloadMeta,
	saveCrosswordDownloadMeta
} from '$lib/features/crossword/crossword-export';

import { downloadCrosswordPdf } from '$lib/features/crossword/crossword-export.pdf';

import type {
	CrosswordDownloadMeta,
	CrosswordPdfMode
} from '$lib/features/crossword/crossword-export.types';

import { buildCrosswordLayout } from '$lib/features/crossword/crossword-generator';

import type { CrosswordImportCommit } from '$lib/features/crossword/crossword-import.types';

import { CROSSWORD_PDF_MODES } from '$lib/features/crossword/crossword-pdf-modes';

import {
	addCrosswordHistorySnapshot,
	cloneCrosswordEntries,
	hasCrosswordEntryContent,
	readCrosswordDraft,
	readCrosswordHistory,
	saveCrosswordDraft
} from '$lib/features/crossword/crossword.persistence';

import type {
	CrosswordHistoryItem,
	CrosswordSaveStatus
} from '$lib/features/crossword/crossword.persistence.types';

import type { CrosswordEntry, CrosswordLayout } from '$lib/features/crossword/crossword.types';

import {
	countCrosswordAnswerEntries,
	createCrosswordGenerationSignature,
	createEmptyCrosswordLayout,
	createInitialCrosswordEntries
} from '$lib/features/crossword/crossword.utils';

/**
 * State dan alur kerja editor TTS: autosave, generate layout, history,
 * import, dan download PDF. Komponen cukup membaca field dan memanggil method.
 */
export class CrosswordSession {
	entries = $state<CrosswordEntry[]>(createInitialCrosswordEntries());

	title = $state('');

	pdfMode = $state<CrosswordPdfMode>('complete');

	layout = $state<CrosswordLayout>(createEmptyCrosswordLayout());

	historyItems = $state<CrosswordHistoryItem[]>([]);

	downloadMeta = $state<CrosswordDownloadMeta | null>(null);

	isGenerating = $state(false);

	isDownloading = $state(false);

	downloadError = $state<string | null>(null);

	saveStatus = $state<CrosswordSaveStatus>('idle');

	lastSavedAt = $state<string | null>(null);

	canSaveVersion = $derived(hasCrosswordEntryContent(this.entries));

	exportReadiness = $derived(getCrosswordExportReadiness(this.entries, this.layout));

	downloadState = $derived(
		getCrosswordDownloadState(
			this.downloadMeta,
			createCrosswordExportSignature(this.entries, this.layout)
		)
	);

	#isPersistenceReady = false;

	#saveTimer: ReturnType<typeof setTimeout> | undefined;

	#generationTimer: ReturnType<typeof setTimeout> | undefined;

	#generationRequestId = 0;

	/**
	 * Browser-only: panggil dari `$effect` (di dalam `untrack`) agar tidak
	 * berjalan saat SSR dan tidak ikut men-track state yang di-assign di sini.
	 */
	restore(): void {
		const storedDraft = readCrosswordDraft();

		if (storedDraft) {
			const restoredEntries = cloneCrosswordEntries(storedDraft.entries);

			this.entries = restoredEntries;
			this.title = storedDraft.title;
			this.lastSavedAt = storedDraft.updatedAt;
			this.saveStatus = 'saved';

			this.#scheduleGeneration(restoredEntries);
		}

		this.historyItems = readCrosswordHistory();
		this.downloadMeta = readCrosswordDownloadMeta();
		this.#isPersistenceReady = true;
	}

	dispose(): void {
		this.#cancelPendingWork();
	}

	setEntries(nextEntries: CrosswordEntry[]): void {
		const previousSignature = createCrosswordGenerationSignature(this.entries);

		const nextSignature = createCrosswordGenerationSignature(nextEntries);

		this.entries = nextEntries;
		this.downloadError = null;

		this.#scheduleDraftSave(nextEntries, this.title);

		// Perubahan yang tidak memengaruhi layout (mis. clue saja) tidak perlu generate ulang.
		if (previousSignature !== nextSignature) {
			this.#scheduleGeneration(nextEntries);
		}
	}

	setTitle(nextTitle: string): void {
		this.title = nextTitle;

		this.#scheduleDraftSave(this.entries, nextTitle);
	}

	setPdfMode(nextMode: CrosswordPdfMode): void {
		this.pdfMode = nextMode;

		this.#scheduleGeneration(this.entries, 0);
	}

	saveVersion(): void {
		this.#saveSnapshot('Manual version');

		this.#persistDraftNow(this.entries, this.title);
	}

	restoreHistory(item: CrosswordHistoryItem): void {
		this.#replaceEntries(item.entries, 'Before restore');
	}

	importEntries(commit: CrosswordImportCommit): void {
		this.#replaceEntries(commit.entries, `Before import: ${commit.fileName}`);
	}

	async downloadPdf(): Promise<void> {
		if (!this.exportReadiness.ready || this.isDownloading) {
			return;
		}

		this.isDownloading = true;
		this.downloadError = null;

		// Snapshot agar PDF sesuai state saat tombol diklik, walau user lanjut mengedit.
		const entriesSnapshot = cloneCrosswordEntries(this.entries);

		const layoutSnapshot = this.layout;

		const signatureSnapshot = createCrosswordExportSignature(entriesSnapshot, layoutSnapshot);

		try {
			const result = await downloadCrosswordPdf(
				entriesSnapshot,
				layoutSnapshot,
				this.title,
				this.pdfMode
			);

			const nextMeta: CrosswordDownloadMeta = {
				version: 1,
				signature: signatureSnapshot,
				downloadedAt: result.downloadedAt,
				fileName: result.fileName
			};

			saveCrosswordDownloadMeta(nextMeta);

			this.downloadMeta = nextMeta;
		} catch (error) {
			console.error('PDF generation failed:', error);

			this.downloadError = 'PDF gagal dibuat. Coba ulangi download.';
		} finally {
			this.isDownloading = false;
		}
	}

	/**
	 * Untuk perubahan besar (restore/import): pending autosave/generate dari
	 * state lama dibatalkan agar tidak menimpa state baru.
	 */
	#replaceEntries(nextEntries: CrosswordEntry[], snapshotLabel: string): void {
		this.#cancelPendingWork();

		this.#saveSnapshot(snapshotLabel);

		const clonedEntries = cloneCrosswordEntries(nextEntries);

		this.entries = clonedEntries;
		this.downloadError = null;

		this.#persistDraftNow(clonedEntries, this.title);

		this.#scheduleGeneration(clonedEntries);
	}

	#saveSnapshot(label: string): void {
		if (!hasCrosswordEntryContent(this.entries)) {
			return;
		}

		const nextHistory = addCrosswordHistorySnapshot(this.entries, label);

		if (nextHistory) {
			this.historyItems = nextHistory;
		}
	}

	#cancelPendingWork(): void {
		clearTimeout(this.#saveTimer);
		this.#saveTimer = undefined;

		clearTimeout(this.#generationTimer);
		this.#generationTimer = undefined;

		// Hasil generate yang masih berjalan dianggap stale.
		this.#generationRequestId += 1;
	}

	#persistDraftNow(nextEntries: CrosswordEntry[], nextTitle: string): void {
		const result = saveCrosswordDraft(nextEntries, nextTitle);

		if (!result.success) {
			this.saveStatus = 'error';

			return;
		}

		this.saveStatus = 'saved';
		this.lastSavedAt = result.savedAt;
	}

	#scheduleDraftSave(nextEntries: CrosswordEntry[], nextTitle: string): void {
		if (!this.#isPersistenceReady) {
			return;
		}

		clearTimeout(this.#saveTimer);

		this.saveStatus = 'saving';

		const entriesSnapshot = cloneCrosswordEntries(nextEntries);

		this.#saveTimer = setTimeout(() => {
			this.#persistDraftNow(entriesSnapshot, nextTitle);

			this.#saveTimer = undefined;
		}, CROSSWORD_AUTOSAVE_DELAY_MS);
	}

	#scheduleGeneration(nextEntries: CrosswordEntry[], delay = CROSSWORD_GENERATION_DELAY_MS): void {
		clearTimeout(this.#generationTimer);
		this.#generationTimer = undefined;

		const requestId = ++this.#generationRequestId;

		if (countCrosswordAnswerEntries(nextEntries) === 0) {
			this.layout = createEmptyCrosswordLayout();
			this.isGenerating = false;

			return;
		}

		this.isGenerating = true;

		const entriesSnapshot = cloneCrosswordEntries(nextEntries);

		this.#generationTimer = setTimeout(() => {
			const isCurrent = () => requestId === this.#generationRequestId;

			try {
				const nextLayout = buildCrosswordLayout(entriesSnapshot, {
					attempts: CROSSWORD_LIVE_ATTEMPTS,
					layoutMode: CROSSWORD_PDF_MODES[this.pdfMode].layoutMode
				});

				if (isCurrent()) {
					this.layout = nextLayout;
				}
			} catch (error) {
				if (isCurrent()) {
					console.error('Crossword generation failed:', error);
				}
			} finally {
				if (isCurrent()) {
					this.isGenerating = false;
					this.#generationTimer = undefined;
				}
			}
		}, delay);
	}
}
