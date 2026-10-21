<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

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
	<Button
		disabled={!canExport}
		title={readiness.reason ?? 'Export current questions and answers as DOCX'}
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
	</Button>

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
