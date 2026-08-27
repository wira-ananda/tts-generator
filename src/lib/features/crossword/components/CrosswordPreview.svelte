<script lang="ts">
	import { Download, LoaderCircle, Puzzle } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';

	import UiWatermark from '$lib/components/ui/UiWatermark.svelte';

	import CrosswordClues from '$lib/features/crossword/components/CrosswordClues.svelte';

	import CrosswordGrid from '$lib/features/crossword/components/CrosswordGrid.svelte';

	import CrosswordStats from '$lib/features/crossword/components/CrosswordStats.svelte';

	import CrosswordUnplacedList from '$lib/features/crossword/components/CrosswordUnplacedList.svelte';

	import { downloadCrosswordImage } from '$lib/features/crossword/crossword-image-export';

	import type {
		CrosswordEntry,
		CrosswordLayout,
		CrosswordPreviewMode
	} from '$lib/features/crossword/crossword.types';

	import { countCrosswordAnswerEntries } from '$lib/features/crossword/crossword.utils';

	type Props = {
		entries: CrosswordEntry[];

		layout: CrosswordLayout;

		isGenerating: boolean;
	};

	let { entries, layout, isGenerating }: Props = $props();

	let previewMode = $state<CrosswordPreviewMode>('puzzle');

	let isDownloadingImage = $state(false);

	let imageDownloadError = $state<string | null>(null);

	let answerCount = $derived(countCrosswordAnswerEntries(entries));

	let showAnswers = $derived(previewMode === 'answer');

	let canDownloadImage = $derived(layout.cells.length > 0 && !isGenerating && !isDownloadingImage);

	function setPreviewMode(mode: CrosswordPreviewMode): void {
		previewMode = mode;

		imageDownloadError = null;
	}

	async function handleDownloadImage(): Promise<void> {
		if (!canDownloadImage) {
			return;
		}

		isDownloadingImage = true;

		imageDownloadError = null;

		try {
			await downloadCrosswordImage({
				layout,

				mode: previewMode
			});
		} catch (error) {
			console.error('Crossword image download failed:', error);

			imageDownloadError = 'Gambar gagal didownload.';
		} finally {
			isDownloadingImage = false;
		}
	}
</script>

<section
	class="
		overflow-hidden
		rounded-md
		border
		border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<header
		class="
			flex min-h-14
			items-center
			justify-between
			gap-4
			border-b
			border-gh-light-border
			px-4
			dark:border-gh-dark-border
		"
	>
		<div class="min-w-0">
			<div
				class="
					flex items-center
					gap-2
				"
			>
				<h3
					class="
						text-sm
						font-semibold
						text-gh-light-fg
						dark:text-gh-dark-fg
					"
				>
					Preview
				</h3>

				{#if isGenerating}
					<Icon
						icon={LoaderCircle}
						size={13}
						strokeWidth={1.8}
						class="
							animate-spin
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					/>
				{/if}
			</div>

			<p
				class="
					text-xs
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				{#if isGenerating}
					Generating...
				{:else if answerCount > 0}
					{layout.placements.length}
					of
					{answerCount}
					answers placed
				{:else}
					Crossword preview
				{/if}
			</p>
		</div>

		<div
			class="
				flex shrink-0
				items-center gap-2
			"
		>
			<!-- Download current preview mode -->
			<button
				type="button"
				disabled={!canDownloadImage}
				title={previewMode === 'answer' ? 'Download answer key as PNG' : 'Download puzzle as PNG'}
				aria-label={previewMode === 'answer'
					? 'Download answer key as PNG'
					: 'Download puzzle as PNG'}
				class="
					inline-flex h-8
					items-center gap-2
					rounded-md
					border
					border-gh-light-border
					bg-gh-light-button
					px-3
					text-xs font-medium
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
				onclick={handleDownloadImage}
			>
				{#if isDownloadingImage}
					<Icon icon={LoaderCircle} size={14} strokeWidth={1.8} class="animate-spin" />
				{:else}
					<Icon icon={Download} size={14} strokeWidth={1.8} />
				{/if}

				<span
					class="
						hidden sm:inline
					"
				>
					{isDownloadingImage ? 'Downloading...' : 'PNG'}
				</span>
			</button>

			<!-- Preview mode switch -->
			<div
				class="
					inline-flex h-8
					items-center
					rounded-md
					border
					border-gh-light-border
					bg-gh-light-subtle
					p-0.5
					dark:border-gh-dark-border
					dark:bg-gh-dark-subtle
				"
			>
				<button
					type="button"
					aria-pressed={previewMode === 'puzzle'}
					class="
						h-6 rounded
						px-2.5
						text-xs font-medium
						transition-colors
						focus-visible:ring-2
						focus-visible:ring-gh-light-focus
						focus-visible:outline-none
						dark:focus-visible:ring-gh-dark-focus
					"
					class:bg-gh-light-canvas={previewMode === 'puzzle'}
					class:text-gh-light-fg={previewMode === 'puzzle'}
					class:shadow-gh-button-light={previewMode === 'puzzle'}
					class:text-gh-light-muted={previewMode !== 'puzzle'}
					class:dark:bg-gh-dark-canvas={previewMode === 'puzzle'}
					class:dark:text-gh-dark-fg={previewMode === 'puzzle'}
					class:dark:shadow-gh-button-dark={previewMode === 'puzzle'}
					class:dark:text-gh-dark-muted={previewMode !== 'puzzle'}
					onclick={() => setPreviewMode('puzzle')}
				>
					Puzzle
				</button>

				<button
					type="button"
					aria-pressed={previewMode === 'answer'}
					class="
						h-6 rounded
						px-2.5
						text-xs font-medium
						transition-colors
						focus-visible:ring-2
						focus-visible:ring-gh-light-focus
						focus-visible:outline-none
						dark:focus-visible:ring-gh-dark-focus
					"
					class:bg-gh-light-canvas={previewMode === 'answer'}
					class:text-gh-light-fg={previewMode === 'answer'}
					class:shadow-gh-button-light={previewMode === 'answer'}
					class:text-gh-light-muted={previewMode !== 'answer'}
					class:dark:bg-gh-dark-canvas={previewMode === 'answer'}
					class:dark:text-gh-dark-fg={previewMode === 'answer'}
					class:dark:shadow-gh-button-dark={previewMode === 'answer'}
					class:dark:text-gh-dark-muted={previewMode !== 'answer'}
					onclick={() => setPreviewMode('answer')}
				>
					Answer key
				</button>
			</div>
		</div>
	</header>

	{#if imageDownloadError}
		<div
			class="
				border-b
				border-gh-light-danger/30
				bg-gh-light-danger-muted
				px-4 py-2
				text-xs
				text-gh-light-danger
				dark:border-gh-dark-danger/30
				dark:bg-gh-dark-danger-muted
				dark:text-gh-dark-danger
			"
		>
			{imageDownloadError}
		</div>
	{/if}

	<div
		class="
			min-h-[520px]
			space-y-3
			p-3
			lg:h-[calc(100dvh-280px)]
			lg:max-h-[720px]
			lg:overflow-y-auto
		"
	>
		<CrosswordStats {answerCount} {layout} />

		<div
			class="
				relative
				flex min-h-[360px]
				items-center
				justify-center
				overflow-auto
				rounded-md
				border
				border-gh-light-border-muted
				bg-gh-light-subtle
				p-5
				dark:border-gh-dark-border-muted
				dark:bg-gh-dark-subtle
			"
		>
			{#if layout.cells.length > 0}
				<CrosswordGrid {layout} {showAnswers} />
			{:else}
				<div
					class="
						max-w-sm
						text-center
					"
				>
					<div
						class="
							mx-auto mb-3
							flex size-10
							items-center
							justify-center
							rounded-md
							border
							border-gh-light-border
							bg-gh-light-canvas
							text-gh-light-muted
							dark:border-gh-dark-border
							dark:bg-gh-dark-canvas
							dark:text-gh-dark-muted
						"
					>
						<Icon icon={Puzzle} size={20} strokeWidth={1.7} />
					</div>

					<p
						class="
							text-sm
							font-medium
							text-gh-light-fg
							dark:text-gh-dark-fg
						"
					>
						No crossword yet
					</p>

					<p
						class="
							mt-1
							text-xs leading-5
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						Masukkan jawaban untuk mulai membuat crossword secara otomatis.
					</p>
				</div>
			{/if}

			<UiWatermark />
		</div>

		<CrosswordClues {entries} {layout} />

		<CrosswordUnplacedList {entries} {layout} />
	</div>
</section>
