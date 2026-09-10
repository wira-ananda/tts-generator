<script lang="ts">
	import { MAX_CROSSWORD_TITLE_LENGTH } from '$lib/features/crossword/crossword.constants';

	type Props = {
		title: string;

		onChange: (title: string) => void;
	};

	let { title, onChange }: Props = $props();

	function handleInput(event: Event): void {
		const target = event.currentTarget as HTMLInputElement;

		onChange(target.value);
	}
</script>

<section
	class="
		mb-4
		overflow-hidden
		rounded-md
		border
		border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<div
		class="
			flex flex-col gap-2
			px-4 py-3
			sm:flex-row
			sm:items-center
			sm:gap-4
		"
	>
		<label
			for="crossword-title"
			class="
				shrink-0
				text-sm font-semibold
				text-gh-light-fg
				sm:w-32
				dark:text-gh-dark-fg
			"
		>
			Judul TTS
		</label>

		<div class="min-w-0 flex-1">
			<input
				id="crossword-title"
				type="text"
				value={title}
				maxlength={MAX_CROSSWORD_TITLE_LENGTH}
				placeholder="Contoh: EVALUASI BAB 1,2 - A"
				class="
					h-9 w-full
					rounded-md
					border
					border-gh-light-border
					bg-gh-light-canvas
					px-3
					text-sm
					text-gh-light-fg
					placeholder:text-gh-light-muted
					focus-visible:ring-2
					focus-visible:ring-gh-light-focus
					focus-visible:outline-none
					dark:border-gh-dark-border
					dark:bg-gh-dark-canvas
					dark:text-gh-dark-fg
					dark:placeholder:text-gh-dark-muted
					dark:focus-visible:ring-gh-dark-focus
				"
				oninput={handleInput}
			/>

			<p
				class="
					mt-1
					text-xs
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Dipakai sebagai judul di dalam PDF dan nama file saat download. Kosongkan untuk pakai nama
				file otomatis (tanggal &amp; jam).
			</p>
		</div>
	</div>
</section>
