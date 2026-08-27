<script lang="ts">
	import { Monitor, Moon, Sun } from 'lucide-svelte';

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

	function handleThemeChange(event: Event) {
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
		class="pointer-events-none absolute left-2.5 z-10 flex size-4 items-center justify-center text-fg-muted"
	>
		{#if selectedTheme === 'light'}
			<Sun size={16} strokeWidth={1.8} />
		{:else if selectedTheme === 'dark'}
			<Moon size={16} strokeWidth={1.8} />
		{:else}
			<Monitor size={16} strokeWidth={1.8} />
		{/if}
	</div>

	<select
		aria-label="Appearance"
		class="
			h-8 cursor-pointer appearance-none rounded-md
			border border-border-default bg-button-default
			py-0 pr-8 pl-8 text-sm font-medium text-fg-default
			shadow-button
			transition-[background-color,border-color] outline-none
			hover:bg-button-hover
			focus:border-accent-emphasis
			focus:ring-2 focus:ring-focus
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
		class="pointer-events-none absolute right-2.5 size-3 fill-fg-muted"
	>
		<path d="M4.4 6.2 8 9.8l3.6-3.6.8.8L8 11.4 3.6 7z"></path>
	</svg>
</div>
