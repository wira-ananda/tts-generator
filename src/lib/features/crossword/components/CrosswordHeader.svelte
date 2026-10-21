<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	import { FileUp, History, Puzzle } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import ThemeSwitcher from '$lib/components/ui/ThemeSwitcher.svelte';

	type Props = {
		historyCount: number;

		onOpenHistory: () => void;

		onOpenImport: () => void;
	};

	let { historyCount, onOpenHistory, onOpenImport }: Props = $props();
</script>

<header
	class="
		border-b
		border-gh-light-border
		bg-gh-light-canvas
		dark:border-gh-dark-border
		dark:bg-gh-dark-canvas
	"
>
	<div
		class="
			mx-auto flex h-16
			max-w-[1600px]
			items-center justify-between
			px-4 sm:px-6
		"
	>
		<div
			class="
				flex min-w-0
				items-center gap-3
			"
		>
			<div
				class="
					flex size-8 shrink-0
					items-center justify-center
					rounded-md
					bg-gh-light-fg
					text-gh-light-canvas
					dark:bg-gh-dark-fg
					dark:text-gh-dark-canvas
				"
			>
				<Icon icon={Puzzle} size={18} strokeWidth={2} />
			</div>

			<div class="min-w-0">
				<h1
					class="
						truncate
						text-sm font-semibold
						text-gh-light-fg
						dark:text-gh-dark-fg
					"
				>
					TTS Generator
				</h1>

				<p
					class="
						hidden
						text-xs
						text-gh-light-muted
						sm:block
						dark:text-gh-dark-muted
					"
				>
					Crossword puzzle generator
				</p>
			</div>
		</div>

		<div
			class="
				flex items-center
				gap-2
			"
		>
			<Button onclick={onOpenHistory}>
				<Icon icon={History} size={16} strokeWidth={1.8} />

				<span class="hidden sm:inline"> History </span>

				{#if historyCount > 0}
					<span
						class="
							inline-flex min-w-4
							items-center justify-center
							rounded-full
							bg-gh-light-inset
							px-1
							text-[10px] font-semibold
							text-gh-light-muted
							dark:bg-gh-dark-inset
							dark:text-gh-dark-muted
						"
					>
						{historyCount}
					</span>
				{/if}
			</Button>

			<Button onclick={onOpenImport}>
				<Icon icon={FileUp} size={16} strokeWidth={1.8} />

				<span class="hidden sm:inline"> Import </span>
			</Button>

			<ThemeSwitcher />
		</div>
	</div>
</header>
