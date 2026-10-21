<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'secondary' | 'primary' | 'ghost' | 'ghost-danger';

	type Size = 'md' | 'sm' | 'icon' | 'icon-sm';

	type Props = HTMLButtonAttributes & {
		variant?: Variant;
		size?: Size;
		children: Snippet;
	};

	let {
		variant = 'secondary',
		size = 'md',
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const BASE = `
		inline-flex shrink-0 items-center justify-center gap-2 rounded-md
		focus-visible:ring-2 focus-visible:ring-gh-light-focus focus-visible:outline-none
		disabled:cursor-not-allowed
		dark:focus-visible:ring-gh-dark-focus
	`;

	const VARIANTS: Record<Variant, string> = {
		secondary: `
			border border-gh-light-border bg-gh-light-button font-medium text-gh-light-fg
			shadow-gh-button-light transition-colors hover:bg-gh-light-button-hover
			disabled:opacity-50
			dark:border-gh-dark-border dark:bg-gh-dark-button dark:text-gh-dark-fg
			dark:shadow-gh-button-dark dark:hover:bg-gh-dark-button-hover
		`,
		primary: `
			border border-gh-light-success-emphasis bg-gh-light-success-emphasis font-semibold
			text-white shadow-gh-button-light transition-[filter,opacity] hover:brightness-95
			disabled:border-gh-light-border disabled:bg-gh-light-button disabled:text-gh-light-muted
			disabled:opacity-60
			dark:border-gh-dark-success-emphasis dark:bg-gh-dark-success-emphasis
			dark:shadow-gh-button-dark
			dark:disabled:border-gh-dark-border dark:disabled:bg-gh-dark-button
			dark:disabled:text-gh-dark-muted
		`,
		ghost: `
			text-gh-light-muted transition-colors
			hover:bg-gh-light-button-hover hover:text-gh-light-fg
			dark:text-gh-dark-muted dark:hover:bg-gh-dark-button-hover dark:hover:text-gh-dark-fg
		`,
		'ghost-danger': `
			text-gh-light-muted transition-colors
			hover:bg-gh-light-danger-muted hover:text-gh-light-danger
			dark:text-gh-dark-muted dark:hover:bg-gh-dark-danger-muted dark:hover:text-gh-dark-danger
		`
	};

	const SIZES: Record<Size, string> = {
		md: 'h-8 px-3 text-sm',
		sm: 'h-8 px-3 text-xs',
		icon: 'size-8',
		'icon-sm': 'size-7'
	};
</script>

<button {type} class={[BASE, VARIANTS[variant], SIZES[size], className]} {...rest}>
	{@render children()}
</button>
