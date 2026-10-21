<svelte:options namespace="svg" />

<script lang="ts">
	import type { LucideIconNode } from '@lucide/icons';

	type Props = {
		icon: { node: LucideIconNode[] };
		size?: number;
		strokeWidth?: number;
		class?: string;
	};

	let { icon, size = 24, strokeWidth = 2, class: className = '' }: Props = $props();
</script>

{#snippet renderNode([tag, attributes, children]: LucideIconNode)}
	<svelte:element this={tag} {...attributes}>
		{#each children ?? [] as child, index (index)}
			{@render renderNode(child)}
		{/each}
	</svelte:element>
{/snippet}

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
	focusable="false"
>
	{#each icon.node as node, index (index)}
		{@render renderNode(node)}
	{/each}
</svg>
