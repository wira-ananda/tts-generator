<script lang="ts">
	import { untrack } from 'svelte';

	import AppFooter from '$lib/components/layout/AppFooter.svelte';

	import CrosswordEditor from '$lib/features/crossword/components/CrosswordEditor.svelte';
	import CrosswordHeader from '$lib/features/crossword/components/CrosswordHeader.svelte';
	import CrosswordHistoryDialog from '$lib/features/crossword/components/CrosswordHistoryDialog.svelte';
	import CrosswordImportDialog from '$lib/features/crossword/components/CrosswordImportDialog.svelte';
	import CrosswordPreview from '$lib/features/crossword/components/CrosswordPreview.svelte';
	import CrosswordTitleField from '$lib/features/crossword/components/CrosswordTitleField.svelte';
	import CrosswordToolbar from '$lib/features/crossword/components/CrosswordToolbar.svelte';

	import type { CrosswordImportCommit } from '$lib/features/crossword/import/crossword-import.types';

	import { CrosswordSession } from '$lib/features/crossword/crossword-session.svelte';

	import type { CrosswordHistoryItem } from '$lib/features/crossword/crossword.persistence.types';

	const session = new CrosswordSession();

	let isHistoryOpen = $state(false);

	let isImportOpen = $state(false);

	$effect(() => {
		untrack(() => session.restore());

		return () => session.dispose();
	});

	function handleRestoreHistory(item: CrosswordHistoryItem): void {
		session.restoreHistory(item);

		isHistoryOpen = false;
	}

	function handleImport(commit: CrosswordImportCommit): void {
		session.importEntries(commit);

		isImportOpen = false;
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
		historyCount={session.historyItems.length}
		onOpenHistory={() => (isHistoryOpen = true)}
		onOpenImport={() => (isImportOpen = true)}
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

		<CrosswordTitleField title={session.title} onChange={(title) => session.setTitle(title)} />

		<CrosswordToolbar
			entries={session.entries}
			downloadState={session.downloadState}
			lastDownloadedAt={session.downloadMeta?.downloadedAt ?? null}
			canDownload={session.exportReadiness.ready}
			disabledReason={session.exportReadiness.reason}
			isDownloading={session.isDownloading}
			downloadError={session.downloadError}
			pdfMode={session.pdfMode}
			onDownload={() => session.downloadPdf()}
			onPdfModeChange={(mode) => session.setPdfMode(mode)}
		/>

		<div
			class="
				grid gap-4
				lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]
			"
		>
			<CrosswordEditor
				entries={session.entries}
				onChange={(entries) => session.setEntries(entries)}
			/>

			<CrosswordPreview
				entries={session.entries}
				layout={session.layout}
				isGenerating={session.isGenerating}
			/>
		</div>
	</main>

	<AppFooter saveStatus={session.saveStatus} lastSavedAt={session.lastSavedAt} />

	<CrosswordHistoryDialog
		open={isHistoryOpen}
		items={session.historyItems}
		canSaveVersion={session.canSaveVersion}
		onClose={() => (isHistoryOpen = false)}
		onSaveVersion={() => session.saveVersion()}
		onRestore={handleRestoreHistory}
	/>

	<CrosswordImportDialog
		open={isImportOpen}
		currentEntries={session.entries}
		onClose={() => (isImportOpen = false)}
		onImport={handleImport}
	/>
</div>
