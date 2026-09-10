<script lang="ts">
	import { Download, LoaderCircle, Save } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';

	import CrosswordDocxExportButton from '$lib/features/crossword/components/CrosswordDocxExportButton.svelte';

	import type {
		CrosswordDownloadState,
		CrosswordPdfMode
	} from '$lib/features/crossword/crossword-export.types';

	import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

	type Props = {
		entries: CrosswordEntry[];

		downloadState: CrosswordDownloadState;

		lastDownloadedAt: string | null;

		canDownload: boolean;

		disabledReason: string | null;

		isDownloading: boolean;

		downloadError: string | null;

		pdfMode: CrosswordPdfMode;

		onDownload: () => void;

		onPdfModeChange: (mode: CrosswordPdfMode) => void;
	};

	let {
		entries,
		downloadState,
		lastDownloadedAt,
		canDownload,
		disabledReason,
		isDownloading,
		downloadError,
		pdfMode,
		onDownload,
		onPdfModeChange
	}: Props = $props();

	function handlePdfModeChange(event: Event): void {
		const target = event.currentTarget as HTMLSelectElement;

		onPdfModeChange(target.value as CrosswordPdfMode);
	}

	function formatDownloadTime(value: string | null): string {
		if (!value) {
			return '';
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return '';
		}

		return new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',

			minute: '2-digit'
		}).format(date);
	}
</script>

<section
	class="
		mb-4
		flex min-h-12
		flex-col gap-3
		rounded-md
		border border-gh-light-border
		bg-gh-light-subtle
		px-4 py-2.5
		sm:flex-row
		sm:items-center
		sm:justify-between
		dark:border-gh-dark-border
		dark:bg-gh-dark-subtle
	"
>
	<div class="min-w-0">
		<div
			class="
				flex items-center gap-2
				text-xs
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			<Icon icon={Save} size={15} strokeWidth={1.8} class="shrink-0" />

			<span> Draft hanya tersimpan di browser ini. Sebaiknya download hasil setelah selesai. </span>
		</div>

		<div
			class="
				mt-1.5
				text-[11px]
			"
		>
			{#if downloadState === 'never'}
				<span
					class="
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					Belum pernah download PDF.
				</span>
			{:else if downloadState === 'stale'}
				<span
					class="
						font-medium
						text-gh-light-attention
						dark:text-gh-dark-attention
					"
				>
					Ada perubahan sejak PDF terakhir didownload.
				</span>
			{:else}
				<span
					class="
						font-medium
						text-gh-light-success
						dark:text-gh-dark-success
					"
				>
					PDF terakhir:
					{formatDownloadTime(lastDownloadedAt)}
				</span>
			{/if}

			{#if downloadError}
				<span
					class="
						ml-2
						text-gh-light-danger
						dark:text-gh-dark-danger
					"
				>
					{downloadError}
				</span>
			{/if}
		</div>
	</div>

	<div
		class="
			flex shrink-0
			flex-col
			items-end gap-1
		"
	>
		<div
			class="
				flex items-start
				gap-2
			"
		>
			<!-- Current questions only -->
			<CrosswordDocxExportButton {entries} />

			<!-- Mode PDF: lengkap / TTS+soal saja / TTS kosong saja -->
			<select
				aria-label="Mode download PDF"
				value={pdfMode}
				disabled={isDownloading}
				class="
					h-8
					rounded-md
					border
					border-gh-light-border
					bg-gh-light-button
					px-2
					text-sm font-medium
					text-gh-light-fg
					shadow-gh-button-light
					transition-colors
					hover:bg-gh-light-button-hover
					focus-visible:ring-2
					focus-visible:ring-gh-light-focus
					focus-visible:outline-none
					disabled:cursor-not-allowed
					disabled:opacity-60
					dark:border-gh-dark-border
					dark:bg-gh-dark-button
					dark:text-gh-dark-fg
					dark:shadow-gh-button-dark
					dark:hover:bg-gh-dark-button-hover
					dark:focus-visible:ring-gh-dark-focus
				"
				onchange={handlePdfModeChange}
			>
				<option value="complete">PDF Lengkap (TTS + Soal + Kunci)</option>

				<option value="puzzle-and-questions">TTS Kosong + Soal</option>

				<option value="puzzle-only">TTS Kosong saja</option>
			</select>

			<!-- Complete TTS PDF -->
			<button
				type="button"
				disabled={!canDownload || isDownloading}
				class="
					inline-flex h-8
					items-center justify-center
					gap-2 rounded-md
					border
					border-gh-light-success-emphasis
					bg-gh-light-success-emphasis
					px-3
					text-sm font-semibold
					text-white
					shadow-gh-button-light
					transition-[filter,opacity]
					hover:brightness-95
					focus-visible:ring-2
					focus-visible:ring-gh-light-focus
					focus-visible:outline-none
					disabled:cursor-not-allowed
					disabled:border-gh-light-border
					disabled:bg-gh-light-button
					disabled:text-gh-light-muted
					disabled:opacity-60
					dark:border-gh-dark-success-emphasis
					dark:bg-gh-dark-success-emphasis
					dark:shadow-gh-button-dark
					dark:focus-visible:ring-gh-dark-focus
					dark:disabled:border-gh-dark-border
					dark:disabled:bg-gh-dark-button
					dark:disabled:text-gh-dark-muted
				"
				onclick={onDownload}
			>
				{#if isDownloading}
					<Icon icon={LoaderCircle} size={15} strokeWidth={1.8} class="animate-spin" />

					Generating PDF...
				{:else}
					<Icon icon={Download} size={15} strokeWidth={1.8} />

					Download PDF
				{/if}
			</button>
		</div>

		{#if !canDownload && disabledReason}
			<span
				class="
					max-w-72
					text-right
					text-[10px]
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				{disabledReason}
			</span>
		{/if}
	</div>
</section>
