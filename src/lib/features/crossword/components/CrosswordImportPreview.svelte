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
	} from '$lib/features/crossword/import/crossword-import.types';

	type Props = {
		mergeMode: CrosswordImportMergeMode;

		validation: CrosswordImportValidation;

		onChangeMode: (mode: CrosswordImportMergeMode) => void;
	};

	let { mergeMode, validation, onChangeMode }: Props = $props();

	let previewRows = $derived(validation.validRows.slice(0, CROSSWORD_IMPORT_PREVIEW_ROW_COUNT));

	let visibleIssues = $derived(validation.issues.slice(0, CROSSWORD_IMPORT_MAX_VISIBLE_ISSUES));

	let hiddenIssueCount = $derived(Math.max(0, validation.issues.length - visibleIssues.length));

	let visibleWarnings = $derived(validation.warnings.slice(0, CROSSWORD_IMPORT_MAX_VISIBLE_ISSUES));

	let hiddenWarningCount = $derived(
		Math.max(0, validation.warnings.length - visibleWarnings.length)
	);

	let stats = $derived([
		{
			label: 'Rows',
			value: validation.totalRowCount,
			tone: 'text-gh-light-fg dark:text-gh-dark-fg'
		},
		{
			label: 'Valid',
			value: validation.validRowCount,
			tone: 'text-gh-light-success dark:text-gh-dark-success'
		},
		{
			label: 'Invalid',
			value: validation.invalidRowCount,
			tone: 'text-gh-light-danger dark:text-gh-dark-danger'
		},
		{
			label: 'Duplicates',
			value: validation.duplicateRowCount,
			tone: 'text-gh-light-fg dark:text-gh-dark-fg'
		},
		{
			label: 'Warnings',
			value: validation.duplicateAnswerWarningCount,
			tone: 'text-gh-light-attention dark:text-gh-dark-attention'
		}
	]);

	const MESSAGE_TONES = {
		attention: {
			section: 'border-gh-light-attention/30 dark:border-gh-dark-attention/30',
			header:
				'border-gh-light-attention/20 bg-gh-light-attention-muted dark:border-gh-dark-attention/20 dark:bg-gh-dark-attention-muted',
			title: 'text-gh-light-attention dark:text-gh-dark-attention'
		},
		danger: {
			section: 'border-gh-light-danger/30 dark:border-gh-dark-danger/30',
			header:
				'border-gh-light-danger/20 bg-gh-light-danger-muted dark:border-gh-dark-danger/20 dark:bg-gh-dark-danger-muted',
			title: 'text-gh-light-danger dark:text-gh-dark-danger'
		}
	};
</script>

{#snippet modeOption(mode: CrosswordImportMergeMode, label: string, description: string)}
	<button
		type="button"
		aria-pressed={mergeMode === mode}
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
		onclick={() => onChangeMode(mode)}
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
					{label}
				</p>

				<p
					class="
						mt-1
						text-xs leading-5
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					{description}
				</p>
			</div>

			{#if mergeMode === mode}
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
{/snippet}

{#snippet rowMessages(
	tone: keyof typeof MESSAGE_TONES,
	title: string,
	items: { rowNumber: number; code: string; message: string }[],
	hiddenText: string | null
)}
	<section class={['overflow-hidden rounded-md border', MESSAGE_TONES[tone].section]}>
		<header class={['flex min-h-9 items-center border-b px-3', MESSAGE_TONES[tone].header]}>
			<h3 class={['text-xs font-semibold', MESSAGE_TONES[tone].title]}>
				{title}
			</h3>
		</header>

		<div class="max-h-40 space-y-2 overflow-y-auto p-3">
			{#each items as item (`${item.rowNumber}-${item.code}`)}
				<div class="flex gap-2 text-xs leading-5">
					<span class="shrink-0 font-semibold text-gh-light-fg dark:text-gh-dark-fg">
						Row {item.rowNumber}
					</span>

					<span class="text-gh-light-muted dark:text-gh-dark-muted">
						{item.message}
					</span>
				</div>
			{/each}

			{#if hiddenText}
				<p class="pt-1 text-xs font-medium text-gh-light-muted dark:text-gh-dark-muted">
					{hiddenText}
				</p>
			{/if}
		</div>
	</section>
{/snippet}

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
			{@render modeOption(
				'append',
				'Append',
				'Pertahankan current questions. Trailing blank forms akan diisi lebih dulu.'
			)}

			{@render modeOption(
				'replace',
				'Replace',
				'Ganti current questions dengan seluruh valid rows dari file.'
			)}
		</div>
	</section>

	<section
		class="
			grid grid-cols-2 gap-px
			overflow-hidden
			rounded-md
			border border-gh-light-border
			bg-gh-light-border-muted
			sm:grid-cols-5
			dark:border-gh-dark-border
			dark:bg-gh-dark-border-muted
		"
	>
		{#each stats as stat, index (stat.label)}
			<div
				class={[
					'bg-gh-light-canvas p-3 dark:bg-gh-dark-canvas',
					index === stats.length - 1 && 'col-span-2 sm:col-span-1'
				]}
			>
				<p class="text-[11px] text-gh-light-muted dark:text-gh-dark-muted">{stat.label}</p>

				<p class={['mt-0.5 text-sm font-semibold', stat.tone]}>{stat.value}</p>
			</div>
		{/each}
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

	{#if visibleWarnings.length > 0}
		{@render rowMessages(
			'attention',
			'Warnings (tetap diimport)',
			visibleWarnings,
			hiddenWarningCount > 0 ? `+ ${hiddenWarningCount} warning lainnya tidak ditampilkan.` : null
		)}
	{/if}

	{#if visibleIssues.length > 0}
		{@render rowMessages(
			'danger',
			'Invalid rows',
			visibleIssues,
			hiddenIssueCount > 0 ? `+ ${hiddenIssueCount} issue lainnya tidak ditampilkan.` : null
		)}
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
