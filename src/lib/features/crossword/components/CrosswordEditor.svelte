<script lang="ts">
	import { Plus } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import CrosswordEntryRow from '$lib/features/crossword/components/CrosswordEntryRow.svelte';
	import { MAX_CROSSWORD_ENTRY_COUNT } from '$lib/features/crossword/crossword.constants';
	import type {
		CrosswordEntry,
		CrosswordEntryField
	} from '$lib/features/crossword/crossword.types';
	import {
		createCrosswordEntry,
		getNextCrosswordEntrySequence,
		removeCrosswordEntry,
		updateCrosswordEntry
	} from '$lib/features/crossword/crossword.utils';

	type Props = {
		entries: CrosswordEntry[];
		onChange: (entries: CrosswordEntry[]) => void;
	};

	let { entries, onChange }: Props = $props();

	let canAddQuestion = $derived(entries.length < MAX_CROSSWORD_ENTRY_COUNT);

	let remainingQuestions = $derived(MAX_CROSSWORD_ENTRY_COUNT - entries.length);

	function handleAddQuestion(): void {
		if (!canAddQuestion) {
			return;
		}

		const nextSequence = getNextCrosswordEntrySequence(entries);

		onChange([...entries, createCrosswordEntry(nextSequence)]);
	}

	function handleUpdateEntry(entryId: string, field: CrosswordEntryField, value: string): void {
		onChange(updateCrosswordEntry(entries, entryId, field, value));
	}

	function handleRemoveEntry(entryId: string): void {
		onChange(removeCrosswordEntry(entries, entryId));
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
			items-center justify-between
			gap-4
			border-b
			border-gh-light-border
			px-4
			dark:border-gh-dark-border
		"
	>
		<div class="min-w-0">
			<h3
				class="
					text-sm font-semibold
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				Questions
			</h3>

			<p
				class="
					text-xs
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				{entries.length}
				/
				{MAX_CROSSWORD_ENTRY_COUNT}
				questions
			</p>
		</div>

		<button
			type="button"
			disabled={!canAddQuestion}
			class="
				inline-flex h-8 shrink-0
				items-center gap-2
				rounded-md
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
				disabled:opacity-60
				dark:border-gh-dark-border
				dark:bg-gh-dark-button
				dark:text-gh-dark-fg
				dark:shadow-gh-button-dark
				dark:hover:bg-gh-dark-button-hover
				dark:focus-visible:ring-gh-dark-focus
			"
			onclick={handleAddQuestion}
		>
			<Icon icon={Plus} size={15} strokeWidth={2} />

			Add question
		</button>
	</header>

	<div
		class="
			border-b
			border-gh-light-border-muted
			bg-gh-light-subtle
			px-4 py-2
			dark:border-gh-dark-border-muted
			dark:bg-gh-dark-subtle
		"
	>
		<p
			class="
				text-xs
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			{#if canAddQuestion}
				{remainingQuestions}
				question slots remaining.
			{:else}
				Maximum 150 questions reached.
			{/if}
		</p>
	</div>

	<div
		class="
			min-h-[520px]
			p-3
			lg:h-[calc(100dvh-280px)]
			lg:max-h-[720px]
			lg:overflow-y-auto
		"
	>
		{#if entries.length > 0}
			<div class="space-y-3">
				{#each entries as entry, index (entry.id)}
					<CrosswordEntryRow
						{entry}
						{index}
						onUpdate={handleUpdateEntry}
						onRemove={handleRemoveEntry}
					/>
				{/each}
			</div>
		{:else}
			<div
				class="
					flex min-h-[488px]
					items-center justify-center
					rounded-md
					border border-dashed
					border-gh-light-border
					bg-gh-light-subtle
					p-6 text-center
					dark:border-gh-dark-border
					dark:bg-gh-dark-subtle
				"
			>
				<div class="max-w-xs">
					<p
						class="
							text-sm font-medium
							text-gh-light-fg
							dark:text-gh-dark-fg
						"
					>
						No questions
					</p>

					<p
						class="
							mt-1
							text-xs leading-5
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						Tambahkan pertanyaan baru untuk mulai membuat teka-teki silang.
					</p>

					<button
						type="button"
						class="
							mt-3
							inline-flex h-8
							items-center gap-2
							rounded-md
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
							dark:border-gh-dark-border
							dark:bg-gh-dark-button
							dark:text-gh-dark-fg
							dark:shadow-gh-button-dark
							dark:hover:bg-gh-dark-button-hover
							dark:focus-visible:ring-gh-dark-focus
						"
						onclick={handleAddQuestion}
					>
						<Icon icon={Plus} size={15} />

						Add question
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>
