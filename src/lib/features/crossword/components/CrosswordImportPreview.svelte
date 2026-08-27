<script lang="ts">
	import { AlertTriangle, Check } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';

	import {
		CROSSWORD_IMPORT_MAX_VISIBLE_ISSUES,
		CROSSWORD_IMPORT_PREVIEW_ROW_COUNT
	} from '$lib/features/crossword/crossword.constants';

	import type {
		CrosswordImportMergeMode,
		CrosswordImportValidation
	} from '$lib/features/crossword/crossword-import.types';

	type Props = {
		mergeMode: CrosswordImportMergeMode;

		validation: CrosswordImportValidation;

		onChangeMode: (mode: CrosswordImportMergeMode) => void;
	};

	let { mergeMode, validation, onChangeMode }: Props = $props();

	let previewRows = $derived(validation.validRows.slice(0, CROSSWORD_IMPORT_PREVIEW_ROW_COUNT));

	let visibleIssues = $derived(validation.issues.slice(0, CROSSWORD_IMPORT_MAX_VISIBLE_ISSUES));

	let hiddenIssueCount = $derived(Math.max(0, validation.issues.length - visibleIssues.length));
</script>

<div class="space-y-4">
	<section>
		<h3
			class="
				mb-2
				text-xs font-semibold
				text-gh-light-fg
				dark:text-gh-dark-fg
			"
		>
			Import behavior
		</h3>

		<div
			class="
				grid gap-2
				sm:grid-cols-2
			"
		>
			<button
				type="button"
				aria-pressed={mergeMode === 'append'}
				class="
					relative min-h-20
					rounded-md
					border border-gh-light-border
					bg-gh-light-canvas
					p-3 text-left
					transition-colors
					hover:bg-gh-light-subtle
					focus-visible:ring-2
					focus-visible:ring-gh-light-focus
					focus-visible:outline-none
					aria-pressed:border-gh-light-accent-emphasis
					aria-pressed:bg-gh-light-accent-muted
					dark:border-gh-dark-border
					dark:bg-gh-dark-canvas
					dark:hover:bg-gh-dark-subtle
					dark:focus-visible:ring-gh-dark-focus
					dark:aria-pressed:border-gh-dark-accent-emphasis
					dark:aria-pressed:bg-gh-dark-accent-muted
				"
				onclick={() => onChangeMode('append')}
			>
				<div
					class="
						flex items-start
						justify-between
						gap-3
					"
				>
					<div>
						<p
							class="
								text-sm
								font-semibold
								text-gh-light-fg
								dark:text-gh-dark-fg
							"
						>
							Append
						</p>

						<p
							class="
								mt-1
								text-xs leading-5
								text-gh-light-muted
								dark:text-gh-dark-muted
							"
						>
							Pertahankan current questions. Trailing blank forms akan diisi lebih dulu.
						</p>
					</div>

					{#if mergeMode === 'append'}
						<div
							class="
								flex size-5 shrink-0
								items-center justify-center
								rounded-full
								bg-gh-light-accent-emphasis
								text-white
								dark:bg-gh-dark-accent-emphasis
							"
						>
							<Icon icon={Check} size={12} strokeWidth={2.5} />
						</div>
					{/if}
				</div>
			</button>

			<button
				type="button"
				aria-pressed={mergeMode === 'replace'}
				class="
					relative min-h-20
					rounded-md
					border border-gh-light-border
					bg-gh-light-canvas
					p-3 text-left
					transition-colors
					hover:bg-gh-light-subtle
					focus-visible:ring-2
					focus-visible:ring-gh-light-focus
					focus-visible:outline-none
					aria-pressed:border-gh-light-accent-emphasis
					aria-pressed:bg-gh-light-accent-muted
					dark:border-gh-dark-border
					dark:bg-gh-dark-canvas
					dark:hover:bg-gh-dark-subtle
					dark:focus-visible:ring-gh-dark-focus
					dark:aria-pressed:border-gh-dark-accent-emphasis
					dark:aria-pressed:bg-gh-dark-accent-muted
				"
				onclick={() => onChangeMode('replace')}
			>
				<div
					class="
						flex items-start
						justify-between
						gap-3
					"
				>
					<div>
						<p
							class="
								text-sm
								font-semibold
								text-gh-light-fg
								dark:text-gh-dark-fg
							"
						>
							Replace
						</p>

						<p
							class="
								mt-1
								text-xs leading-5
								text-gh-light-muted
								dark:text-gh-dark-muted
							"
						>
							Ganti current questions dengan seluruh valid rows dari file.
						</p>
					</div>

					{#if mergeMode === 'replace'}
						<div
							class="
								flex size-5 shrink-0
								items-center justify-center
								rounded-full
								bg-gh-light-accent-emphasis
								text-white
								dark:bg-gh-dark-accent-emphasis
							"
						>
							<Icon icon={Check} size={12} strokeWidth={2.5} />
						</div>
					{/if}
				</div>
			</button>
		</div>
	</section>

	<section
		class="
			grid grid-cols-2
			overflow-hidden
			rounded-md
			border border-gh-light-border
			bg-gh-light-canvas
			sm:grid-cols-4
			dark:border-gh-dark-border
			dark:bg-gh-dark-canvas
		"
	>
		<div class="p-3">
			<p
				class="
					text-[11px]
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Rows
			</p>

			<p
				class="
					mt-0.5
					text-sm font-semibold
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				{validation.totalRowCount}
			</p>
		</div>

		<div
			class="
				border-l
				border-gh-light-border-muted
				p-3
				dark:border-gh-dark-border-muted
			"
		>
			<p
				class="
					text-[11px]
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Valid
			</p>

			<p
				class="
					mt-0.5
					text-sm font-semibold
					text-gh-light-success
					dark:text-gh-dark-success
				"
			>
				{validation.validRowCount}
			</p>
		</div>

		<div
			class="
				border-t
				border-gh-light-border-muted
				p-3
				sm:border-t-0
				sm:border-l
				dark:border-gh-dark-border-muted
			"
		>
			<p
				class="
					text-[11px]
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Invalid
			</p>

			<p
				class="
					mt-0.5
					text-sm font-semibold
					text-gh-light-danger
					dark:text-gh-dark-danger
				"
			>
				{validation.invalidRowCount}
			</p>
		</div>

		<div
			class="
				border-t border-l
				border-gh-light-border-muted
				p-3
				sm:border-t-0
				dark:border-gh-dark-border-muted
			"
		>
			<p
				class="
					text-[11px]
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			>
				Duplicates
			</p>

			<p
				class="
					mt-0.5
					text-sm font-semibold
					text-gh-light-fg
					dark:text-gh-dark-fg
				"
			>
				{validation.duplicateRowCount}
			</p>
		</div>
	</section>

	{#if validation.limitExceeded}
		<div
			class="
				flex gap-2
				rounded-md
				border
				border-gh-light-danger/40
				bg-gh-light-danger-muted
				p-3
				text-xs
				dark:border-gh-dark-danger/40
				dark:bg-gh-dark-danger-muted
			"
		>
			<Icon
				icon={AlertTriangle}
				size={15}
				strokeWidth={1.8}
				class="
					mt-0.5 shrink-0
					text-gh-light-danger
					dark:text-gh-dark-danger
				"
			/>

			<div>
				<p
					class="
						font-semibold
						text-gh-light-danger
						dark:text-gh-dark-danger
					"
				>
					Import melebihi limit 150 questions.
				</p>

				<p
					class="
						mt-1
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					Mode ini hanya memiliki kapasitas
					{validation.capacity}
					valid rows. Projected result:
					{validation.projectedEntryCount}
					questions.
				</p>
			</div>
		</div>
	{/if}

	{#if previewRows.length > 0}
		<section
			class="
				overflow-hidden
				rounded-md
				border border-gh-light-border
				dark:border-gh-dark-border
			"
		>
			<header
				class="
					flex min-h-9
					items-center justify-between
					border-b
					border-gh-light-border-muted
					bg-gh-light-subtle
					px-3
					dark:border-gh-dark-border-muted
					dark:bg-gh-dark-subtle
				"
			>
				<h3
					class="
						text-xs font-semibold
						text-gh-light-fg
						dark:text-gh-dark-fg
					"
				>
					Valid rows preview
				</h3>

				<span
					class="
						text-[11px]
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					Projected:
					{validation.projectedEntryCount}
					questions
				</span>
			</header>

			<div class="overflow-x-auto">
				<table
					class="
						w-full
						border-collapse
						text-left text-xs
					"
				>
					<thead
						class="
							bg-gh-light-canvas
							text-gh-light-muted
							dark:bg-gh-dark-canvas
							dark:text-gh-dark-muted
						"
					>
						<tr>
							<th
								class="
									w-14
									border-b
									border-gh-light-border-muted
									px-3 py-2
									font-medium
									dark:border-gh-dark-border-muted
								"
							>
								Row
							</th>

							<th
								class="
									border-b
									border-gh-light-border-muted
									px-3 py-2
									font-medium
									dark:border-gh-dark-border-muted
								"
							>
								Question
							</th>

							<th
								class="
									w-40
									border-b
									border-gh-light-border-muted
									px-3 py-2
									font-medium
									dark:border-gh-dark-border-muted
								"
							>
								Answer
							</th>
						</tr>
					</thead>

					<tbody>
						{#each previewRows as row (row.sourceRowNumber)}
							<tr
								class="
									text-gh-light-fg
									dark:text-gh-dark-fg
								"
							>
								<td
									class="
										border-b
										border-gh-light-border-muted
										px-3 py-2
										text-gh-light-muted
										dark:border-gh-dark-border-muted
										dark:text-gh-dark-muted
									"
								>
									{row.sourceRowNumber}
								</td>

								<td
									class="
										max-w-80
										border-b
										border-gh-light-border-muted
										px-3 py-2
										dark:border-gh-dark-border-muted
									"
								>
									<div class="truncate">
										{row.question}
									</div>
								</td>

								<td
									class="
										border-b
										border-gh-light-border-muted
										px-3 py-2
										dark:border-gh-dark-border-muted
									"
								>
									{row.answer}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	{#if visibleIssues.length > 0}
		<section
			class="
				overflow-hidden
				rounded-md
				border
				border-gh-light-danger/30
				dark:border-gh-dark-danger/30
			"
		>
			<header
				class="
					flex min-h-9
					items-center
					border-b
					border-gh-light-danger/20
					bg-gh-light-danger-muted
					px-3
					dark:border-gh-dark-danger/20
					dark:bg-gh-dark-danger-muted
				"
			>
				<h3
					class="
						text-xs font-semibold
						text-gh-light-danger
						dark:text-gh-dark-danger
					"
				>
					Invalid rows
				</h3>
			</header>

			<div
				class="
					max-h-40
					space-y-2
					overflow-y-auto
					p-3
				"
			>
				{#each visibleIssues as issue (`${issue.rowNumber}-${issue.code}`)}
					<div
						class="
							flex gap-2
							text-xs leading-5
						"
					>
						<span
							class="
								shrink-0 font-semibold
								text-gh-light-fg
								dark:text-gh-dark-fg
							"
						>
							Row {issue.rowNumber}
						</span>

						<span
							class="
								text-gh-light-muted
								dark:text-gh-dark-muted
							"
						>
							{issue.message}
						</span>
					</div>
				{/each}

				{#if hiddenIssueCount > 0}
					<p
						class="
							pt-1
							text-xs font-medium
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						+ {hiddenIssueCount} issue lainnya tidak ditampilkan.
					</p>
				{/if}
			</div>
		</section>
	{/if}

	{#if validation.invalidRowCount > 0}
		<p
			class="
				text-[11px]
				leading-5
				text-gh-light-muted
				dark:text-gh-dark-muted
			"
		>
			Invalid rows tidak akan dimasukkan. Hanya valid rows yang akan diimport setelah confirmation.
		</p>
	{/if}
</div>
