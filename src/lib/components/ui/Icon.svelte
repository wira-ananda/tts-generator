<script lang="ts">
	type SvgNodeTag = 'circle' | 'ellipse' | 'g' | 'line' | 'path' | 'polygon' | 'polyline' | 'rect';

	type SvgNodeAttributes = Record<string, string | number>;

	type IconNode = [tag: SvgNodeTag, attributes: SvgNodeAttributes];

	type IconData = {
		name?: string;
		node: IconNode[];
		size?: number;
		width?: number;
		height?: number;
	};

	type Props = {
		icon: IconData;
		size?: number;
		strokeWidth?: number;
		class?: string;
	};

	let { icon, size = 24, strokeWidth = 2, class: className = '' }: Props = $props();
</script>

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
	{#each icon.node as node}
		<svelte:element this={node[0]} {...node[1]} />
	{/each}
</svg>
