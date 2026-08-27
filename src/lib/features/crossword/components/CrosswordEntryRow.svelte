<script lang="ts">
	import { Trash2 } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import type {
		CrosswordEntry,
		CrosswordEntryField
	} from '$lib/features/crossword/crossword.types';

	type Props = {
		entry: CrosswordEntry;
		index: number;
		onUpdate: (entryId: string, field: CrosswordEntryField, value: string) => void;
		onRemove: (entryId: string) => void;
	};

	let { entry, index, onUpdate, onRemove }: Props = $props();

	function handleInput(event: Event, field: CrosswordEntryField): void {
		const element = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;

		onUpdate(entry.id, field, element.value);
	}
</script>

<article
	class="
		rounded-md
		border border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<header
		class="
			flex min-h-10
			items-center justify-between
			gap-3
			border-b border-gh-light-border-muted
			bg-gh-light-subtle
			px-3
			dark:border-gh-dark-border-muted
			dark:bg-gh-dark-subtle
		"
	>
		<div class="flex min-w-0 items-center gap-2">
			<span
				class="
					inline-flex size-5 shrink-0
					items-center justify-center
					rounded-full
					border border-gh-light-border
					bg-gh-light-canvas
					text-[11px] font-semibold
					text-gh-light-muted
					dark:border-gh-dark-border
					dark:bg-gh-dark-canvas
					dark:text-gh-dark-muted
				"
			>
				{index + 1}
			</span>

			<span
				class="
					truncate
					text-xs font-semibold
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				Question {index + 1}
			</span>
		</div>

		<button
			type="button"
			aria-label={`Remove question ${index + 1}`}
			title={`Remove question ${index + 1}`}
			class="
				inline-flex size-7 shrink-0
				items-center justify-center
				rounded-md
				text-gh-light-muted
				transition-colors
				hover:bg-gh-light-danger-muted
				hover:text-gh-light-danger
				focus-visible:ring-2
				focus-visible:ring-gh-light-focus
				focus-visible:outline-none
				dark:text-gh-dark-muted
				dark:hover:bg-gh-dark-danger-muted
				dark:hover:text-gh-dark-danger
				dark:focus-visible:ring-gh-dark-focus
			"
			onclick={() => onRemove(entry.id)}
		>
			<Icon icon={Trash2} size={15} strokeWidth={1.8} />
		</button>
	</header>

	<div
		class="
			grid gap-3 p-3
			md:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)]
		"
	>
		<div class="min-w-0">
			<label
				for={`clue-${entry.id}`}
				class="
					mb-1.5 block
					text-xs font-medium
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				Question
			</label>

			<textarea
				id={`clue-${entry.id}`}
				rows="2"
				placeholder="Masukkan soal..."
				value={entry.clue}
				oninput={(event) => handleInput(event, 'clue')}
				class="
					block min-h-[66px] w-full
					resize-y rounded-md
					border border-gh-light-border
					bg-gh-light-input
					px-3 py-2
					text-sm leading-5
					text-gh-light-fg
					transition-[border-color,box-shadow]
					outline-none
					placeholder:text-gh-light-subtle-fg
					hover:border-gh-light-subtle-fg
					focus:border-gh-light-accent-emphasis
					focus:ring-2
					focus:ring-gh-light-focus
					dark:border-gh-dark-border
					dark:bg-gh-dark-input
					dark:text-gh-dark-fg
					dark:placeholder:text-gh-dark-subtle-fg
					dark:hover:border-gh-dark-subtle-fg
					dark:focus:border-gh-dark-accent-emphasis
					dark:focus:ring-gh-dark-focus
				"></textarea>
		</div>

		<div class="min-w-0">
			<label
				for={`answer-${entry.id}`}
				class="
					mb-1.5 block
					text-xs font-medium
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				Answer
			</label>

			<input
				id={`answer-${entry.id}`}
				type="text"
				autocomplete="off"
				spellcheck="false"
				placeholder="Masukkan jawaban..."
				value={entry.answer}
				oninput={(event) => handleInput(event, 'answer')}
				class="
					block h-8 w-full
					rounded-md
					border border-gh-light-border
					bg-gh-light-input
					px-3
					text-sm
					text-gh-light-fg
					transition-[border-color,box-shadow]
					outline-none
					placeholder:text-gh-light-subtle-fg
					hover:border-gh-light-subtle-fg
					focus:border-gh-light-accent-emphasis
					focus:ring-2
					focus:ring-gh-light-focus
					dark:border-gh-dark-border
					dark:bg-gh-dark-input
					dark:text-gh-dark-fg
					dark:placeholder:text-gh-dark-subtle-fg
					dark:hover:border-gh-dark-subtle-fg
					dark:focus:border-gh-dark-accent-emphasis
					dark:focus:ring-gh-dark-focus
				"
			/>

			<p
				class="
					mt-1.5
					text-[11px] leading-4
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Spasi dan tanda baca akan dinormalisasi saat crossword dibuat.
			</p>
		</div>
	</div>
</article>
