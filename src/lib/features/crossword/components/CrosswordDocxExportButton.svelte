<script lang="ts">
	import { FileText, LoaderCircle } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';

	import {
		downloadCurrentCrosswordDocx,
		getCrosswordDocxExportReadiness
	} from '$lib/features/crossword/crossword-docx-export';

	import type { CrosswordEntry } from '$lib/features/crossword/crossword.types';

	type Props = {
		entries: CrosswordEntry[];
	};

	let { entries }: Props = $props();

	let isExporting = $state(false);

	let exportError = $state<string | null>(null);

	let readiness = $derived(getCrosswordDocxExportReadiness(entries));

	let canExport = $derived(readiness.ready && !isExporting);

	async function handleExport(): Promise<void> {
		if (!canExport) {
			return;
		}

		isExporting = true;

		exportError = null;

		try {
			await downloadCurrentCrosswordDocx(entries);
		} catch (error) {
			console.error('DOCX export failed:', error);

			exportError = error instanceof Error ? error.message : 'DOCX gagal dibuat.';
		} finally {
			isExporting = false;
		}
	}
</script>

<div
	class="
		flex flex-col
		items-end gap-1
	"
>
	<button
		type="button"
		disabled={!canExport}
		title={readiness.reason ?? 'Export current questions and answers as DOCX'}
		class="
			inline-flex h-8
			items-center justify-center
			gap-2 rounded-md
			border
			border-gh-light-border
			bg-gh-light-button
			px-3
			text-sm font-medium
			text-gh-light-fg
			shadow-gh-button-light
			transition-colors
			hover:bg-gh-light-button-hover
			focus-visible:ring-2
			focus-visible:ring-gh-light-focus
			focus-visible:outline-none
			disabled:cursor-not-allowed
			disabled:opacity-50
			dark:border-gh-dark-border
			dark:bg-gh-dark-button
			dark:text-gh-dark-fg
			dark:shadow-gh-button-dark
			dark:hover:bg-gh-dark-button-hover
			dark:focus-visible:ring-gh-dark-focus
		"
		onclick={handleExport}
	>
		{#if isExporting}
			<Icon icon={LoaderCircle} size={15} strokeWidth={1.8} class="animate-spin" />

			<span
				class="
					hidden sm:inline
				"
			>
				Exporting...
			</span>
		{:else}
			<Icon icon={FileText} size={15} strokeWidth={1.8} />

			<span> DOCX </span>
		{/if}
	</button>

	{#if exportError}
		<span
			class="
				max-w-60
				text-right
				text-[10px]
				text-gh-light-danger
				dark:text-gh-dark-danger
			"
		>
			{exportError}
		</span>
	{/if}
</div>
