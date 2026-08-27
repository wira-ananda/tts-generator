<script lang="ts">
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

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (open && event.key === 'Escape') {
			onClose();
		}
	}

	function handleBackdropClick(): void {
		onClose();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<button
		type="button"
		aria-label="Close history"
		class="
			fixed inset-0 z-[60]
			cursor-default
			bg-black/55
		"
		onclick={handleBackdropClick}
	></button>

	<div
		class="
			pointer-events-none
			fixed inset-0 z-[70]
			flex items-center justify-center
			p-4
		"
	>
		<section
			role="dialog"
			aria-modal="true"
			aria-labelledby="history-title"
			class="
				pointer-events-auto
				flex max-h-[80dvh]
				w-full max-w-2xl
				flex-col overflow-hidden
				rounded-md
				border border-gh-light-border
				bg-gh-light-overlay
				shadow-gh-overlay-light
				dark:border-gh-dark-border
				dark:bg-gh-dark-overlay
				dark:shadow-gh-overlay-dark
			"
		>
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

				<button
					type="button"
					aria-label="Close history"
					class="
						inline-flex size-8
						items-center justify-center
						rounded-md
						text-gh-light-muted
						transition-colors
						hover:bg-gh-light-button-hover
						hover:text-gh-light-fg
						focus-visible:ring-2
						focus-visible:ring-gh-light-focus
						focus-visible:outline-none
						dark:text-gh-dark-muted
						dark:hover:bg-gh-dark-button-hover
						dark:hover:text-gh-dark-fg
						dark:focus-visible:ring-gh-dark-focus
					"
					onclick={onClose}
				>
					<Icon icon={X} size={16} strokeWidth={1.8} />
				</button>
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

				<button
					type="button"
					disabled={!canSaveVersion}
					class="
						inline-flex h-8 shrink-0
						items-center gap-2
						rounded-md
						border border-gh-light-border
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
						disabled:opacity-50
						dark:border-gh-dark-border
						dark:bg-gh-dark-button
						dark:text-gh-dark-fg
						dark:shadow-gh-button-dark
						dark:hover:bg-gh-dark-button-hover
						dark:focus-visible:ring-gh-dark-focus
					"
					onclick={onSaveVersion}
				>
					<Icon icon={Save} size={14} strokeWidth={1.8} />

					Save version
				</button>
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

								<button
									type="button"
									class="
										inline-flex h-8 shrink-0
										items-center justify-center
										gap-2 rounded-md
										border border-gh-light-border
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
									onclick={() => onRestore(item)}
								>
									<Icon icon={RotateCcw} size={14} strokeWidth={1.8} />

									Restore
								</button>
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
		</section>
	</div>
{/if}
