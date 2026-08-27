<script lang="ts">
	import type { CrosswordLayout } from '$lib/features/crossword/crossword.types';

	type Props = {
		layout: CrosswordLayout;
		showAnswers?: boolean;
	};

	let { layout, showAnswers = false }: Props = $props();

	let maxDimension = $derived(Math.max(layout.width, layout.height));

	let cellSize = $derived.by(() => {
		if (maxDimension <= 18) {
			return 32;
		}

		if (maxDimension <= 25) {
			return 28;
		}

		if (maxDimension <= 35) {
			return 24;
		}

		if (maxDimension <= 50) {
			return 20;
		}

		return 18;
	});

	let gridWidth = $derived(layout.width * cellSize);

	let gridHeight = $derived(layout.height * cellSize);
</script>

{#if layout.cells.length > 0}
	<div
		class="
			relative shrink-0
			select-none
		"
		style={`width: ${gridWidth}px; height: ${gridHeight}px;`}
	>
		{#each layout.cells as cell (`${cell.x}:${cell.y}`)}
			<div
				class="
					absolute
					flex items-center
					justify-center
					border
					border-gh-light-fg
					bg-gh-light-canvas
					text-gh-light-fg
					dark:border-gh-dark-fg
					dark:bg-gh-dark-canvas
					dark:text-gh-dark-fg
				"
				style={`
					left: ${cell.x * cellSize}px;
					top: ${cell.y * cellSize}px;
					width: ${cellSize}px;
					height: ${cellSize}px;
				`}
			>
				{#if cell.numbers && cell.numbers.length > 0}
					<span
						class="
							pointer-events-none
							absolute
							top-[1px] left-[2px]
							max-w-[90%]
							overflow-hidden
							text-[7px]
							leading-none
							font-semibold
							tracking-[-0.04em]
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
						title={`Question ${cell.numbers.join(', ')}`}
					>
						{cell.numbers.join('/')}
					</span>
				{/if}

				{#if showAnswers}
					<span
						class="
							leading-none
							font-semibold
							tracking-tight
						"
						class:text-sm={cellSize >= 24}
						class:text-xs={cellSize < 24}
					>
						{cell.letter}
					</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}
