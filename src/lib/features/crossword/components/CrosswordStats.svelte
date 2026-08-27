<script lang="ts">
	import type { CrosswordLayout } from '$lib/features/crossword/crossword.types';

	type Props = {
		answerCount: number;
		layout: CrosswordLayout;
	};

	let { answerCount, layout }: Props = $props();

	let gridSize = $derived(
		layout.width > 0 && layout.height > 0 ? `${layout.width} × ${layout.height}` : '—'
	);
</script>

<div
	class="
		grid grid-cols-2
		overflow-hidden
		rounded-md
		border
		border-gh-light-border
		bg-gh-light-canvas
		sm:grid-cols-4
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<div
		class="
			min-w-0 p-3
			sm:border-r
			sm:border-gh-light-border-muted
			dark:sm:border-gh-dark-border-muted
		"
	>
		<p
			class="
				text-[11px] font-medium
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			Answers
		</p>

		<p
			class="
				mt-0.5
				text-sm font-semibold
				text-gh-light-fg
				dark:text-gh-dark-fg
			"
		>
			{answerCount}
		</p>
	</div>

	<div
		class="
			min-w-0 border-l
			border-gh-light-border-muted
			p-3
			sm:border-r
			sm:border-l-0
			dark:border-gh-dark-border-muted
			dark:sm:border-gh-dark-border-muted
		"
	>
		<p
			class="
				text-[11px] font-medium
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			Placed
		</p>

		<p
			class="
				mt-0.5
				text-sm font-semibold
				text-gh-light-success
				dark:text-gh-dark-success
			"
		>
			{layout.placements.length}
		</p>
	</div>

	<div
		class="
			min-w-0
			border-t
			border-gh-light-border-muted
			p-3
			sm:border-t-0
			sm:border-r
			dark:border-gh-dark-border-muted
			dark:sm:border-gh-dark-border-muted
		"
	>
		<p
			class="
				text-[11px] font-medium
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			Unplaced
		</p>

		<p
			class="
				mt-0.5
				text-sm font-semibold
				text-gh-light-fg
				dark:text-gh-dark-fg
			"
			class:text-gh-light-danger={layout.unplacedEntries.length > 0}
			class:dark:text-gh-dark-danger={layout.unplacedEntries.length > 0}
		>
			{layout.unplacedEntries.length}
		</p>
	</div>

	<div
		class="
			min-w-0
			border-t border-l
			border-gh-light-border-muted
			p-3
			sm:border-t-0
			sm:border-l-0
			dark:border-gh-dark-border-muted
		"
	>
		<p
			class="
				text-[11px] font-medium
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			Grid
		</p>

		<p
			class="
				mt-0.5 truncate
				text-sm font-semibold
				text-gh-light-fg
				dark:text-gh-dark-fg
			"
		>
			{gridSize}
		</p>
	</div>
</div>
