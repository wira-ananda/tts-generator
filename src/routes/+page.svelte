<script lang="ts">
	import AppFooter from '$lib/components/layout/AppFooter.svelte';

	import CrosswordEditor from '$lib/features/crossword/components/CrosswordEditor.svelte';
	import CrosswordHeader from '$lib/features/crossword/components/CrosswordHeader.svelte';
	import CrosswordHistoryDialog from '$lib/features/crossword/components/CrosswordHistoryDialog.svelte';
	import CrosswordImportDialog from '$lib/features/crossword/components/CrosswordImportDialog.svelte';
	import CrosswordPreview from '$lib/features/crossword/components/CrosswordPreview.svelte';
	import CrosswordToolbar from '$lib/features/crossword/components/CrosswordToolbar.svelte';

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

	import type { CrosswordDownloadMeta } from '$lib/features/crossword/crossword-export.types';

	import { buildCrosswordLayout } from '$lib/features/crossword/crossword-generator';

	import type { CrosswordImportCommit } from '$lib/features/crossword/crossword-import.types';

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

	let entries = $state<CrosswordEntry[]>(createInitialCrosswordEntries());

	let layout = $state<CrosswordLayout>(createEmptyCrosswordLayout());

	let historyItems = $state<CrosswordHistoryItem[]>([]);

	let downloadMeta = $state<CrosswordDownloadMeta | null>(null);

	let isHistoryOpen = $state(false);

	let isImportOpen = $state(false);

	let isPersistenceReady = $state(false);

	let isGenerating = $state(false);

	let isDownloading = $state(false);

	let downloadError = $state<string | null>(null);

	let saveStatus = $state<CrosswordSaveStatus>('idle');

	let lastSavedAt = $state<string | null>(null);

	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	let generationTimer: ReturnType<typeof setTimeout> | undefined;

	let generationRequestId = 0;

	let canSaveVersion = $derived(hasCrosswordEntryContent(entries));

	let exportSignature = $derived(createCrosswordExportSignature(entries, layout));

	let exportReadiness = $derived(getCrosswordExportReadiness(entries, layout));

	let downloadState = $derived(getCrosswordDownloadState(downloadMeta, exportSignature));

	/**
	 * Browser-only initialization.
	 *
	 * Penting:
	 * effect ini tidak membaca reactive entries sebelum
	 * mengassign entries kembali agar tidak terjadi effect loop.
	 */
	$effect(() => {
		const storedDraft = readCrosswordDraft();

		const storedHistory = readCrosswordHistory();

		const storedDownloadMeta = readCrosswordDownloadMeta();

		if (storedDraft) {
			const restoredEntries = cloneCrosswordEntries(storedDraft.entries);

			entries = restoredEntries;

			lastSavedAt = storedDraft.updatedAt;

			saveStatus = 'saved';

			scheduleCrosswordGeneration(restoredEntries, CROSSWORD_GENERATION_DELAY_MS);
		}

		historyItems = storedHistory;

		downloadMeta = storedDownloadMeta;

		isPersistenceReady = true;

		return () => {
			cancelPendingWork();
		};
	});

	function cancelPendingWork(): void {
		if (saveTimer) {
			clearTimeout(saveTimer);

			saveTimer = undefined;
		}

		if (generationTimer) {
			clearTimeout(generationTimer);

			generationTimer = undefined;
		}

		/**
		 * Semua generation result sebelumnya dianggap stale.
		 */
		generationRequestId += 1;
	}

	function persistDraftImmediately(nextEntries: CrosswordEntry[]): void {
		const result = saveCrosswordDraft(nextEntries);

		if (!result.success) {
			saveStatus = 'error';

			return;
		}

		saveStatus = 'saved';

		lastSavedAt = result.savedAt;
	}

	function scheduleDraftSave(nextEntries: CrosswordEntry[]): void {
		if (!isPersistenceReady) {
			return;
		}

		if (saveTimer) {
			clearTimeout(saveTimer);
		}

		saveStatus = 'saving';

		const entriesSnapshot = cloneCrosswordEntries(nextEntries);

		saveTimer = setTimeout(() => {
			persistDraftImmediately(entriesSnapshot);

			saveTimer = undefined;
		}, CROSSWORD_AUTOSAVE_DELAY_MS);
	}

	function scheduleCrosswordGeneration(
		nextEntries: CrosswordEntry[],
		delay = CROSSWORD_GENERATION_DELAY_MS
	): void {
		if (generationTimer) {
			clearTimeout(generationTimer);

			generationTimer = undefined;
		}

		const requestId = ++generationRequestId;

		const answerCount = countCrosswordAnswerEntries(nextEntries);

		if (answerCount === 0) {
			layout = createEmptyCrosswordLayout();

			isGenerating = false;

			return;
		}

		isGenerating = true;

		const entriesSnapshot = cloneCrosswordEntries(nextEntries);

		generationTimer = setTimeout(() => {
			try {
				const nextLayout = buildCrosswordLayout(entriesSnapshot, {
					attempts: CROSSWORD_LIVE_ATTEMPTS
				});

				if (requestId !== generationRequestId) {
					return;
				}

				/**
				 * Atomic preview update.
				 */
				layout = nextLayout;
			} catch (error) {
				if (requestId === generationRequestId) {
					console.error('Crossword generation failed:', error);
				}
			} finally {
				if (requestId === generationRequestId) {
					isGenerating = false;

					generationTimer = undefined;
				}
			}
		}, delay);
	}

	function handleEntriesChange(nextEntries: CrosswordEntry[]): void {
		const previousSignature = createCrosswordGenerationSignature(entries);

		const nextSignature = createCrosswordGenerationSignature(nextEntries);

		entries = nextEntries;

		downloadError = null;

		scheduleDraftSave(nextEntries);

		/**
		 * Mengubah clue saja tidak menjalankan generator ulang.
		 *
		 * Signature berubah hanya bila data yang memengaruhi
		 * layout/numbering berubah.
		 */
		if (previousSignature !== nextSignature) {
			scheduleCrosswordGeneration(nextEntries);
		}
	}

	function saveCurrentSnapshot(label: string): void {
		if (!hasCrosswordEntryContent(entries)) {
			return;
		}

		const nextHistory = addCrosswordHistorySnapshot(entries, label);

		if (nextHistory) {
			historyItems = nextHistory;
		}
	}

	function handleOpenHistory(): void {
		isHistoryOpen = true;
	}

	function handleCloseHistory(): void {
		isHistoryOpen = false;
	}

	function handleOpenImport(): void {
		isImportOpen = true;
	}

	function handleCloseImport(): void {
		isImportOpen = false;
	}

	function handleSaveVersion(): void {
		saveCurrentSnapshot('Manual version');

		persistDraftImmediately(entries);
	}

	function handleRestoreHistory(item: CrosswordHistoryItem): void {
		cancelPendingWork();

		saveCurrentSnapshot('Before restore');

		const restoredEntries = cloneCrosswordEntries(item.entries);

		entries = restoredEntries;

		downloadError = null;

		persistDraftImmediately(restoredEntries);

		scheduleCrosswordGeneration(restoredEntries);

		handleCloseHistory();
	}

	function handleImport(commit: CrosswordImportCommit): void {
		/**
		 * Import termasuk destructive / major state change.
		 *
		 * Pending work harus dibatalkan agar draft/generation
		 * dari state sebelumnya tidak menimpa imported state.
		 */
		cancelPendingWork();

		saveCurrentSnapshot(`Before import: ${commit.fileName}`);

		const importedEntries = cloneCrosswordEntries(commit.entries);

		entries = importedEntries;

		downloadError = null;

		persistDraftImmediately(importedEntries);

		scheduleCrosswordGeneration(importedEntries);

		handleCloseImport();
	}

	async function handleDownloadPdf(): Promise<void> {
		if (!exportReadiness.ready || isDownloading) {
			return;
		}

		isDownloading = true;

		downloadError = null;

		/**
		 * Export harus konsisten dengan exact state
		 * ketika tombol Download diklik.
		 */
		const entriesSnapshot = cloneCrosswordEntries(entries);

		const layoutSnapshot = layout;

		const signatureSnapshot = createCrosswordExportSignature(entriesSnapshot, layoutSnapshot);

		try {
			const result = await downloadCrosswordPdf(entriesSnapshot, layoutSnapshot);

			const nextMeta: CrosswordDownloadMeta = {
				version: 1,

				signature: signatureSnapshot,

				downloadedAt: result.downloadedAt,

				fileName: result.fileName
			};

			saveCrosswordDownloadMeta(nextMeta);

			downloadMeta = nextMeta;
		} catch (error) {
			console.error('PDF generation failed:', error);

			downloadError = 'PDF gagal dibuat. Coba ulangi download.';
		} finally {
			isDownloading = false;
		}
	}
</script>

<svelte:head>
	<title>TTS Generator</title>

	<meta
		name="description"
		content="Buat teka-teki silang secara otomatis dari kumpulan soal dan jawaban."
	/>
</svelte:head>

<div
	class="
		min-h-dvh
		bg-gh-light-canvas
		text-gh-light-fg
		dark:bg-gh-dark-canvas
		dark:text-gh-dark-fg
	"
>
	<CrosswordHeader
		historyCount={historyItems.length}
		onOpenHistory={handleOpenHistory}
		onOpenImport={handleOpenImport}
	/>

	<main
		class="
			mx-auto
			max-w-[1600px]
			px-4 pt-6 pb-24
			sm:px-6
		"
	>
		<div class="mb-5">
			<h2
				class="
					text-xl font-semibold
					tracking-tight
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				Generator
			</h2>

			<p
				class="
					mt-1
					text-sm
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Masukkan soal dan jawaban untuk membuat teka-teki silang secara otomatis.
			</p>
		</div>

		<div
			class="
				grid gap-4
				lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]
			"
		>
			<CrosswordEditor {entries} onChange={handleEntriesChange} />

			<CrosswordPreview {entries} {layout} {isGenerating} />
		</div>

		<CrosswordToolbar
			{entries}
			{downloadState}
			lastDownloadedAt={downloadMeta?.downloadedAt ?? null}
			canDownload={exportReadiness.ready}
			disabledReason={exportReadiness.reason}
			{isDownloading}
			{downloadError}
			onDownload={handleDownloadPdf}
		/>
	</main>

	<AppFooter {saveStatus} {lastSavedAt} />

	<CrosswordHistoryDialog
		open={isHistoryOpen}
		items={historyItems}
		{canSaveVersion}
		onClose={handleCloseHistory}
		onSaveVersion={handleSaveVersion}
		onRestore={handleRestoreHistory}
	/>

	<CrosswordImportDialog
		open={isImportOpen}
		currentEntries={entries}
		onClose={handleCloseImport}
		onImport={handleImport}
	/>
</div>
