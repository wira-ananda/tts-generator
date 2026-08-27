<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/icons';

	import Icon from '$lib/components/ui/Icon.svelte';
	import {
		applyThemeMode,
		getStoredThemeMode,
		isThemeMode,
		setThemeMode,
		watchSystemTheme
	} from '$lib/theme/theme';
	import type { ThemeMode } from '$lib/theme/theme.types';

	let selectedTheme = $state<ThemeMode>('system');

	// Sinkronisasi theme dengan browser preference dan perubahan theme OS.
	$effect(() => {
		selectedTheme = getStoredThemeMode();
		applyThemeMode(selectedTheme);

		return watchSystemTheme(() => {
			if (getStoredThemeMode() === 'system') {
				applyThemeMode('system');
			}
		});
	});

	function handleThemeChange(event: Event): void {
		const select = event.currentTarget as HTMLSelectElement;

		if (!isThemeMode(select.value)) {
			return;
		}

		selectedTheme = select.value;
		setThemeMode(selectedTheme);
	}
</script>

<div class="relative inline-flex h-8 items-center">
	<div
		class="
			pointer-events-none absolute left-2.5 z-10
			flex size-4 items-center justify-center
			text-gh-light-muted
			dark:text-gh-dark-muted
		"
	>
		{#if selectedTheme === 'light'}
			<Icon icon={Sun} size={16} strokeWidth={1.8} />
		{:else if selectedTheme === 'dark'}
			<Icon icon={Moon} size={16} strokeWidth={1.8} />
		{:else}
			<Icon icon={Monitor} size={16} strokeWidth={1.8} />
		{/if}
	</div>

	<select
		aria-label="Appearance"
		class="
			h-8 cursor-pointer appearance-none
			rounded-md border
			border-gh-light-border
			bg-gh-light-button
			py-0 pr-8 pl-8
			text-sm font-medium
			text-gh-light-fg
			shadow-gh-button-light
			transition-[background-color,border-color,box-shadow]
			outline-none
			hover:bg-gh-light-button-hover
			focus:border-gh-light-accent-emphasis
			focus:ring-2
			focus:ring-gh-light-focus
			dark:border-gh-dark-border
			dark:bg-gh-dark-button
			dark:text-gh-dark-fg
			dark:shadow-gh-button-dark
			dark:hover:bg-gh-dark-button-hover
			dark:focus:border-gh-dark-accent-emphasis
			dark:focus:ring-gh-dark-focus
		"
		value={selectedTheme}
		onchange={handleThemeChange}
	>
		<option value="light">Light</option>
		<option value="dark">Dark</option>
		<option value="system">System</option>
	</select>

	<svg
		aria-hidden="true"
		viewBox="0 0 16 16"
		class="
			pointer-events-none absolute right-2.5
			size-3
			fill-gh-light-muted
			dark:fill-gh-dark-muted
		"
	>
		<path d="M4.4 6.2 8 9.8l3.6-3.6.8.8L8 11.4 3.6 7z"></path>
	</svg>
</div>
