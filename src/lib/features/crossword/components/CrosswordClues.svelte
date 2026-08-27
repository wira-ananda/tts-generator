<script lang="ts">
	import type {
		CrosswordEntry,
		CrosswordLayout,
		CrosswordPlacement
	} from '$lib/features/crossword/crossword.types';

	type Props = {
		entries: CrosswordEntry[];
		layout: CrosswordLayout;
	};

	let { entries, layout }: Props = $props();

	/**
	 * Mapping entryId ke entry beserta nomor Question
	 * sesuai urutan visual pada editor.
	 */
	let entryById = $derived.by(() => {
		return new Map(
			entries.map((entry, index) => [
				entry.id,
				{
					entry,
					questionNumber: index + 1
				}
			])
		);
	});

	let acrossPlacements = $derived.by(() => {
		return layout.placements
			.filter((placement) => placement.direction === 'across')
			.sort(sortPlacement);
	});

	let downPlacements = $derived.by(() => {
		return layout.placements
			.filter((placement) => placement.direction === 'down')
			.sort(sortPlacement);
	});

	function sortPlacement(first: CrosswordPlacement, second: CrosswordPlacement): number {
		return first.number - second.number;
	}
</script>

<section
	class="
		overflow-hidden rounded-md
		border border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<header
		class="
			flex min-h-10 items-center
			border-b border-gh-light-border-muted
			bg-gh-light-subtle px-3
			dark:border-gh-dark-border-muted
			dark:bg-gh-dark-subtle
		"
	>
		<h4
			class="
				text-xs font-semibold
				text-gh-light-fg
				dark:text-gh-dark-fg
			"
		>
			Clues
		</h4>
	</header>

	<div
		class="
			grid
			md:grid-cols-2
			md:divide-x
			md:divide-gh-light-border-muted
			dark:md:divide-gh-dark-border-muted
		"
	>
		<!-- Mendatar -->
		<div
			class="
				min-w-0
				border-b border-gh-light-border-muted
				p-3
				md:border-b-0
				dark:border-gh-dark-border-muted
			"
		>
			<h5
				class="
					mb-2
					text-[11px] font-semibold
					tracking-wide text-gh-light-muted
					uppercase
					dark:text-gh-dark-muted
				"
			>
				Mendatar
			</h5>

			<div
				class="
					max-h-44
					space-y-2
					overflow-y-auto
					pr-1
				"
			>
				{#if acrossPlacements.length > 0}
					{#each acrossPlacements as placement (`across-${placement.entryId}`)}
						{@const source = entryById.get(placement.entryId)}
						{@const clue = source?.entry.clue.trim() ?? ''}
						{@const questionNumber = source?.questionNumber ?? placement.number}

						<div
							class="
								flex gap-2
								text-xs leading-5
							"
						>
							<span
								class="
									w-6 shrink-0
									text-right font-semibold
									text-gh-light-muted
									dark:text-gh-dark-muted
								"
							>
								{questionNumber}.
							</span>

							{#if clue}
								<span
									class="
										min-w-0
										text-gh-light-fg
										dark:text-gh-dark-fg
									"
								>
									{clue}
								</span>
							{:else}
								<span
									class="
										min-w-0 text-gh-light-muted
										italic
										dark:text-gh-dark-muted
									"
								>
									Soal belum diisi.
								</span>
							{/if}
						</div>
					{/each}
				{:else}
					<p
						class="
							text-xs
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						Belum ada soal mendatar.
					</p>
				{/if}
			</div>
		</div>

		<!-- Menurun -->
		<div class="min-w-0 p-3">
			<h5
				class="
					mb-2
					text-[11px] font-semibold
					tracking-wide text-gh-light-muted
					uppercase
					dark:text-gh-dark-muted
				"
			>
				Menurun
			</h5>

			<div
				class="
					max-h-44
					space-y-2
					overflow-y-auto
					pr-1
				"
			>
				{#if downPlacements.length > 0}
					{#each downPlacements as placement (`down-${placement.entryId}`)}
						{@const source = entryById.get(placement.entryId)}
						{@const clue = source?.entry.clue.trim() ?? ''}
						{@const questionNumber = source?.questionNumber ?? placement.number}

						<div
							class="
								flex gap-2
								text-xs leading-5
							"
						>
							<span
								class="
									w-6 shrink-0
									text-right font-semibold
									text-gh-light-muted
									dark:text-gh-dark-muted
								"
							>
								{questionNumber}.
							</span>

							{#if clue}
								<span
									class="
										min-w-0
										text-gh-light-fg
										dark:text-gh-dark-fg
									"
								>
									{clue}
								</span>
							{:else}
								<span
									class="
										min-w-0 text-gh-light-muted
										italic
										dark:text-gh-dark-muted
									"
								>
									Soal belum diisi.
								</span>
							{/if}
						</div>
					{/each}
				{:else}
					<p
						class="
							text-xs
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						Belum ada soal menurun.
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>
