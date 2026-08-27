<script lang="ts">
	import { ExternalLink, Save } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import type { CrosswordSaveStatus } from '$lib/features/crossword/crossword.persistence.types';

	type Props = {
		saveStatus: CrosswordSaveStatus;
		lastSavedAt: string | null;
	};

	let { saveStatus, lastSavedAt }: Props = $props();

	function formatSavedTime(value: string | null): string {
		if (!value) {
			return 'Draft lokal siap';
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return 'Tersimpan lokal';
		}

		return `Tersimpan ${new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date)}`;
	}
</script>

<footer
	class="
		fixed inset-x-0 bottom-0 z-50
		border-t border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<div
		class="
			mx-auto flex h-11
			max-w-[1600px]
			items-center justify-between
			gap-4
			px-4 sm:px-6
		"
	>
		<div class="flex min-w-0 items-center gap-2 text-xs">
			<Icon
				icon={Save}
				size={14}
				strokeWidth={1.8}
				class="
					shrink-0
					text-gh-light-muted
					dark:text-gh-dark-muted
				"
			/>

			{#if saveStatus === 'saving'}
				<span
					class="
						size-2 shrink-0
						animate-pulse rounded-full
						bg-gh-light-attention
						dark:bg-gh-dark-attention
					"
				></span>

				<span
					class="
						truncate
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					Menyimpan...
				</span>
			{:else if saveStatus === 'error'}
				<span
					class="
						size-2 shrink-0 rounded-full
						bg-gh-light-danger
						dark:bg-gh-dark-danger
					"
				></span>

				<span
					class="
						truncate
						text-gh-light-danger
						dark:text-gh-dark-danger
					"
				>
					Gagal menyimpan draft
				</span>
			{:else}
				<span
					class="
						size-2 shrink-0 rounded-full
						bg-gh-light-success
						dark:bg-gh-dark-success
					"
				></span>

				<span
					class="
						truncate
						text-gh-light-muted
						dark:text-gh-dark-muted
					"
				>
					{formatSavedTime(lastSavedAt)}
				</span>
			{/if}
		</div>

		<div
			aria-hidden="true"
			class="
				hidden text-[10px]
				font-medium tracking-[0.16em]
				text-gh-light-subtle-fg
				opacity-60
				select-none
				md:block
				dark:text-gh-dark-subtle-fg
			"
		>
			TTS GENERATOR · BETA VERSION
		</div>

		<a
			href="https://wiraananda.vercel.app/"
			target="_blank"
			rel="noopener noreferrer"
			class="
				inline-flex shrink-0
				items-center gap-1.5
				text-xs font-medium
				text-gh-light-muted
				transition-colors
				hover:text-gh-light-accent
				focus-visible:rounded
				focus-visible:ring-2
				focus-visible:ring-gh-light-focus
				focus-visible:outline-none
				dark:text-gh-dark-muted
				dark:hover:text-gh-dark-accent
				dark:focus-visible:ring-gh-dark-focus
			"
		>
			<span>Created by Wiraa</span>

			<Icon icon={ExternalLink} size={12} strokeWidth={1.8} />
		</a>
	</div>
</footer>
