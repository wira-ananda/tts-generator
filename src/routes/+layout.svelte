<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="currentColor" />
</svelte:head>

{@render children()}
