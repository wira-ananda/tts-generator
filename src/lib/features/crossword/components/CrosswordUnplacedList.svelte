<script lang="ts">
	import { AlertTriangle } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import type {
		CrosswordEntry,
		CrosswordLayout,
		CrosswordUnplacedReason
	} from '$lib/features/crossword/crossword.types';

	type Props = {
		entries: CrosswordEntry[];
		layout: CrosswordLayout;
	};

	let { entries, layout }: Props = $props();

	let entryById = $derived.by(
		() =>
			new Map(
				entries.map((entry, index) => [
					entry.id,
					{
						entry,
						index
					}
				])
			)
	);

	function getReasonLabel(reason: CrosswordUnplacedReason): string {
		switch (reason) {
			case 'invalid-answer':
				return 'Jawaban tidak memiliki karakter yang dapat digunakan.';

			case 'duplicate-answer':
				return 'Jawaban sama dengan jawaban lain setelah normalisasi.';

			case 'no-intersection':
				return 'Tidak ditemukan huruf yang cocok dengan crossword saat ini.';

			case 'no-valid-placement':
				return 'Ada huruf yang cocok, tetapi tidak ditemukan posisi yang valid.';
		}
	}
</script>

{#if layout.unplacedEntries.length > 0}
	<section
		class="
			overflow-hidden
			rounded-md
			border
			border-gh-light-danger/30
			bg-gh-light-danger-muted/45
			dark:border-gh-dark-danger/30
			dark:bg-gh-dark-danger-muted/45
		"
	>
		<header
			class="
				flex min-h-10
				items-center gap-2
				border-b
				border-gh-light-danger/20
				px-3
				dark:border-gh-dark-danger/20
			"
		>
			<Icon
				icon={AlertTriangle}
				size={14}
				strokeWidth={1.8}
				class="
					shrink-0
					text-gh-light-danger
					dark:text-gh-dark-danger
				"
			/>

			<h4
				class="
					text-xs font-semibold
					text-gh-light-danger
					dark:text-gh-dark-danger
				"
			>
				{layout.unplacedEntries.length}
				jawaban belum dapat ditempatkan
			</h4>
		</header>

		<div
			class="
				max-h-36
				space-y-2
				overflow-y-auto
				p-3
			"
		>
			{#each layout.unplacedEntries as unplaced (unplaced.entryId)}
				{@const source = entryById.get(unplaced.entryId)}

				<div
					class="
						text-xs
						leading-5
					"
				>
					<div
						class="
							flex flex-wrap
							items-center gap-x-2
						"
					>
						<span
							class="
								font-semibold
								text-gh-light-fg
								dark:text-gh-dark-fg
							"
						>
							#{(source?.index ?? 0) + 1}
						</span>

						<code
							class="
								rounded
								bg-gh-light-canvas/70
								px-1.5 py-0.5
								text-[11px]
								font-semibold
								text-gh-light-fg
								dark:bg-gh-dark-canvas/70
								dark:text-gh-dark-fg
							"
						>
							{source?.entry.answer || unplaced.answer}
						</code>
					</div>

					<p
						class="
							mt-0.5
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						{getReasonLabel(unplaced.reason)}
					</p>
				</div>
			{/each}
		</div>
	</section>
{/if}
