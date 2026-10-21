import { browser } from '$app/environment';

import { THEME_MODES, type ResolvedTheme, type ThemeMode } from '$lib/theme/theme.types';

export const THEME_STORAGE_KEY = 'tts-generator:theme';

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

export function isThemeMode(value: string | null): value is ThemeMode {
	return THEME_MODES.some((themeMode) => themeMode === value);
}

export function getStoredThemeMode(): ThemeMode {
	if (!browser) {
		return 'system';
	}

	try {
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

		return isThemeMode(storedTheme) ? storedTheme : 'system';
	} catch {
		return 'system';
	}
}

export function resolveThemeMode(themeMode: ThemeMode): ResolvedTheme {
	if (themeMode !== 'system') {
		return themeMode;
	}

	if (!browser) {
		return 'light';
	}

	return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light';
}

/**
 * Hanya menerapkan ke DOM; tidak menyimpan preference.
 */
export function applyThemeMode(themeMode: ThemeMode): void {
	if (!browser) {
		return;
	}

	const resolvedTheme = resolveThemeMode(themeMode);

	document.documentElement.dataset.theme = resolvedTheme;
	document.documentElement.dataset.themeMode = themeMode;
	document.documentElement.style.colorScheme = resolvedTheme;
}

export function setThemeMode(themeMode: ThemeMode): void {
	if (!browser) {
		return;
	}

	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
	} catch {
		// Theme tetap dapat digunakan untuk sesi aktif walaupun storage unavailable.
	}

	applyThemeMode(themeMode);
}

export function watchSystemTheme(onChange: (resolvedTheme: ResolvedTheme) => void): () => void {
	if (!browser) {
		return () => undefined;
	}

	const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

	const handleChange = (event: MediaQueryListEvent) => {
		onChange(event.matches ? 'dark' : 'light');
	};

	mediaQuery.addEventListener('change', handleChange);

	return () => {
		mediaQuery.removeEventListener('change', handleChange);
	};
}
