<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';

	import { History, RotateCcw, Save, X } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import type { CrosswordHistoryItem } from '$lib/features/crossword/crossword.persistence.types';
	import { countCompletedCrosswordEntries } from '$lib/features/crossword/crossword.utils';

	type Props = {
		open: boolean;
		items: CrosswordHistoryItem[];
		canSaveVersion: boolean;
		onClose: () => void;
		onSaveVersion: () => void;
		onRestore: (item: CrosswordHistoryItem) => void;
	};

	let { open, items, canSaveVersion, onClose, onSaveVersion, onRestore }: Props = $props();

	function formatHistoryDate(value: string): string {
		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}
</script>

<Dialog {open} {onClose} labelledby="history-title" class="max-h-[80dvh] max-w-2xl">
	<header
		class="
			flex min-h-14
			items-center justify-between
			gap-4
			border-b border-gh-light-border
			px-4
			dark:border-gh-dark-border
		"
	>
		<div
			class="
				flex min-w-0
				items-center gap-2.5
			"
		>
			<div
				class="
					flex size-8 shrink-0
					items-center justify-center
					rounded-md
					border border-gh-light-border
					bg-gh-light-subtle
					text-gh-light-muted
					dark:border-gh-dark-border
					dark:bg-gh-dark-subtle
					dark:text-gh-dark-muted
				"
			>
				<Icon icon={History} size={16} strokeWidth={1.8} />
			</div>

			<div class="min-w-0">
				<h2
					id="history-title"
					class="
						text-sm font-semibold
						text-gh-light-fg
						dark:text-gh-dark-fg
					"
				>
					Version history
				</h2>

				<p
					class="
						text-xs
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					Max 20 versi tersimpan lokal.
				</p>
			</div>
		</div>

		<Button variant="ghost" size="icon" aria-label="Close history" onclick={onClose}>
			<Icon icon={X} size={16} strokeWidth={1.8} />
		</Button>
	</header>

	<div
		class="
			flex items-center
			justify-between gap-3
			border-b
			border-gh-light-border-muted
			bg-gh-light-subtle
			px-4 py-3
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
			Simpan snapshot sebelum perubahan besar.
		</p>

		<Button disabled={!canSaveVersion} onclick={onSaveVersion}>
			<Icon icon={Save} size={14} strokeWidth={1.8} />

			Save version
		</Button>
	</div>

	<div
		class="
			min-h-0 flex-1
			overflow-y-auto
			p-3
		"
	>
		{#if items.length > 0}
			<div class="space-y-2">
				{#each items as item (item.id)}
					<article
						class="
							flex flex-col gap-3
							rounded-md
							border border-gh-light-border
							bg-gh-light-canvas
							p-3
							sm:flex-row
							sm:items-center
							sm:justify-between
							dark:border-gh-dark-border
							dark:bg-gh-dark-canvas
						"
					>
						<div class="min-w-0">
							<p
								class="
									truncate
									text-sm font-medium
									text-gh-light-fg
									dark:text-gh-dark-fg
								"
							>
								{item.label}
							</p>

							<div
								class="
									mt-1
									flex flex-wrap
									items-center
									gap-x-2 gap-y-1
									text-xs
									text-gh-light-muted
									dark:text-gh-dark-muted
								"
							>
								<span>
									{formatHistoryDate(item.savedAt)}
								</span>

								<span aria-hidden="true"> · </span>

								<span>
									{item.entries.length}
									questions
								</span>

								<span aria-hidden="true"> · </span>

								<span>
									{countCompletedCrosswordEntries(item.entries)}
									complete
								</span>
							</div>
						</div>

						<Button onclick={() => onRestore(item)}>
							<Icon icon={RotateCcw} size={14} strokeWidth={1.8} />

							Restore
						</Button>
					</article>
				{/each}
			</div>
		{:else}
			<div
				class="
					flex min-h-60
					items-center justify-center
					text-center
				"
			>
				<div class="max-w-xs">
					<div
						class="
							mx-auto mb-3
							flex size-10
							items-center justify-center
							rounded-md
							border border-gh-light-border
							bg-gh-light-subtle
							text-gh-light-muted
							dark:border-gh-dark-border
							dark:bg-gh-dark-subtle
							dark:text-gh-dark-muted
						"
					>
						<Icon icon={History} size={18} strokeWidth={1.8} />
					</div>

					<p
						class="
							text-sm font-medium
							text-gh-light-fg
							dark:text-gh-dark-fg
						"
					>
						No history yet
					</p>

					<p
						class="
							mt-1
							text-xs leading-5
							text-gh-light-muted
							dark:text-gh-dark-muted
						"
					>
						Simpan version untuk membuat snapshot yang dapat direstore.
					</p>
				</div>
			</div>
		{/if}
	</div>
</Dialog>
