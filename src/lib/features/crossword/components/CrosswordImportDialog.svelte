<script lang="ts">
	import { FileText, FileUp, LoaderCircle, X } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';

	import CrosswordImportPreview from '$lib/features/crossword/components/CrosswordImportPreview.svelte';

	import {
		applyCrosswordImport,
		parseCrosswordImportFile,
		validateCrosswordImport
	} from '$lib/features/crossword/crossword-import';

	import type {
		CrosswordImportCommit,
		CrosswordImportMergeMode,
		CrosswordImportSource
	} from '$lib/features/crossword/crossword-import.types';

	import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

	type Props = {
		open: boolean;

		currentEntries: CrosswordEntry[];

		onClose: () => void;

		onImport: (commit: CrosswordImportCommit) => void;
	};

	let { open, currentEntries, onClose, onImport }: Props = $props();

	let fileInput: HTMLInputElement | undefined;

	let mergeMode = $state<CrosswordImportMergeMode>('append');

	let source = $state<CrosswordImportSource | null>(null);

	let isParsing = $state(false);

	let parseError = $state<string | null>(null);

	let parseRequestId = 0;

	let validation = $derived.by(() => {
		if (!source) {
			return null;
		}

		return validateCrosswordImport(source, currentEntries, mergeMode);
	});

	let canConfirm = $derived(
		Boolean(validation && validation.validRowCount > 0 && !validation.limitExceeded && !isParsing)
	);

	function resetFile(): void {
		parseRequestId += 1;

		source = null;

		parseError = null;

		isParsing = false;

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleClose(): void {
		resetFile();

		mergeMode = 'append';

		onClose();
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (open && event.key === 'Escape') {
			handleClose();
		}
	}

	function openFilePicker(): void {
		fileInput?.click();
	}

	async function processFile(file: File): Promise<void> {
		const requestId = ++parseRequestId;

		source = null;

		parseError = null;

		isParsing = true;

		try {
			const parsed = await parseCrosswordImportFile(file);

			if (requestId === parseRequestId) {
				source = parsed;
			}
		} catch (error) {
			if (requestId === parseRequestId) {
				parseError = error instanceof Error ? error.message : 'File tidak dapat diparse.';
			}
		} finally {
			if (requestId === parseRequestId) {
				isParsing = false;
			}
		}
	}

	function handleFileChange(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;

		const file = input.files?.[0];

		if (file) {
			void processFile(file);
		}
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();

		const file = event.dataTransfer?.files?.[0];

		if (file) {
			void processFile(file);
		}
	}

	function handleConfirm(): void {
		if (!source || !validation || !canConfirm) {
			return;
		}

		const entries = applyCrosswordImport(currentEntries, validation.validRows, mergeMode);

		onImport({
			entries,

			mode: mergeMode,

			fileName: source.fileName,

			importedCount: validation.validRowCount
		});

		resetFile();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<button
		type="button"
		aria-label="Close import dialog"
		class="
			fixed inset-0 z-[60]
			cursor-default
			bg-black/55
		"
		onclick={handleClose}
	></button>

	<div
		class="
			pointer-events-none
			fixed inset-0 z-[70]
			flex items-center
			justify-center p-4
		"
	>
		<section
			role="dialog"
			aria-modal="true"
			aria-labelledby="import-title"
			class="
				pointer-events-auto
				flex max-h-[88dvh]
				w-full max-w-3xl
				flex-col overflow-hidden
				rounded-md
				border border-gh-light-border
				bg-gh-light-overlay
				shadow-gh-overlay-light
				dark:border-gh-dark-border
				dark:bg-gh-dark-overlay
				dark:shadow-gh-overlay-dark
			"
		>
			<header
				class="
					flex min-h-14
					items-center justify-between
					border-b
					border-gh-light-border
					px-4
					dark:border-gh-dark-border
				"
			>
				<div>
					<h2
						id="import-title"
						class="
							text-sm font-semibold
							text-gh-light-fg
							dark:text-gh-dark-fg
						"
					>
						Import questions
					</h2>

					<p
						class="
							text-xs
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						CSV · XLSX · DOCX
					</p>
				</div>

				<button
					type="button"
					aria-label="Close"
					class="
						inline-flex size-8
						items-center justify-center
						rounded-md
						text-gh-light-muted
						hover:bg-gh-light-button-hover
						dark:text-gh-dark-muted
						dark:hover:bg-gh-dark-button-hover
					"
					onclick={handleClose}
				>
					<Icon icon={X} size={16} />
				</button>
			</header>

			<div
				class="
					min-h-0 flex-1
					overflow-y-auto p-4
				"
			>
				<input
					bind:this={fileInput}
					type="file"
					accept=".csv,.xlsx,.docx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					class="hidden"
					onchange={handleFileChange}
				/>

				{#if !source}
					<button
						type="button"
						disabled={isParsing}
						class="
							flex min-h-48
							w-full flex-col
							items-center justify-center
							rounded-md
							border border-dashed
							border-gh-light-border
							bg-gh-light-subtle
							p-6 text-center
							hover:border-gh-light-accent-emphasis
							dark:border-gh-dark-border
							dark:bg-gh-dark-subtle
							dark:hover:border-gh-dark-accent-emphasis
						"
						onclick={openFilePicker}
						ondrop={handleDrop}
						ondragover={(event) => event.preventDefault()}
					>
						{#if isParsing}
							<Icon icon={LoaderCircle} size={22} class="animate-spin" />

							<p class="mt-3 text-sm font-semibold">Parsing file...</p>
						{:else}
							<Icon icon={FileUp} size={22} />

							<p class="mt-3 text-sm font-semibold">Choose CSV, XLSX, or DOCX</p>

							<p
								class="
									mt-1 text-xs
									text-gh-light-muted
									dark:text-gh-dark-muted
								"
							>
								Klik atau drop file di sini.
							</p>
						{/if}
					</button>

					<div
						class="
							mt-4 rounded-md
							border border-gh-light-border
							bg-gh-light-canvas
							p-3
							dark:border-gh-dark-border
							dark:bg-gh-dark-canvas
						"
					>
						<div class="flex gap-2">
							<Icon
								icon={FileText}
								size={15}
								class="
									mt-0.5 shrink-0
									text-gh-light-muted
									dark:text-gh-dark-muted
								"
							/>

							<div>
								<p
									class="
										text-xs font-semibold
										text-gh-light-fg
										dark:text-gh-dark-fg
									"
								>
									Format Word
								</p>

								<pre
									class="
										mt-2 text-xs
										whitespace-pre-wrap
										text-gh-light-muted
										dark:text-gh-dark-muted
									">1. Pertanyaan pertama = Jawaban
2. Pertanyaan kedua = Jawaban</pre>
							</div>
						</div>
					</div>
				{:else}
					<div
						class="
							mb-4 flex
							items-center justify-between
							rounded-md
							border border-gh-light-border
							bg-gh-light-subtle
							px-3 py-2
							dark:border-gh-dark-border
							dark:bg-gh-dark-subtle
						"
					>
						<span
							class="
								truncate text-xs
								font-medium
							"
						>
							{source.fileName}
						</span>

						<button
							type="button"
							class="
								text-xs font-medium
								text-gh-light-accent
								dark:text-gh-dark-accent
							"
							onclick={openFilePicker}
						>
							Choose another
						</button>
					</div>

					{#if validation}
						<CrosswordImportPreview
							{validation}
							{mergeMode}
							onChangeMode={(mode) => (mergeMode = mode)}
						/>
					{/if}
				{/if}

				{#if parseError}
					<p
						class="
							mt-4 rounded-md
							border
							border-gh-light-danger/40
							bg-gh-light-danger-muted
							p-3 text-xs
							text-gh-light-danger
							dark:border-gh-dark-danger/40
							dark:bg-gh-dark-danger-muted
							dark:text-gh-dark-danger
						"
					>
						{parseError}
					</p>
				{/if}
			</div>

			<footer
				class="
					flex min-h-14
					items-center justify-end
					gap-2 border-t
					border-gh-light-border
					bg-gh-light-subtle
					px-4
					dark:border-gh-dark-border
					dark:bg-gh-dark-subtle
				"
			>
				<button
					type="button"
					class="
						h-8 rounded-md
						border border-gh-light-border
						bg-gh-light-button
						px-3 text-sm
						font-medium
						dark:border-gh-dark-border
						dark:bg-gh-dark-button
					"
					onclick={handleClose}
				>
					Cancel
				</button>

				<button
					type="button"
					disabled={!canConfirm}
					class="
						h-8 rounded-md
						bg-gh-light-success-emphasis
						px-3 text-sm
						font-semibold text-white
						disabled:cursor-not-allowed
						disabled:opacity-50
						dark:bg-gh-dark-success-emphasis
					"
					onclick={handleConfirm}
				>
					{#if validation}
						Import {validation.validRowCount} rows
					{:else}
						Import
					{/if}
				</button>
			</footer>
		</section>
	</div>
{/if}
