<script lang="ts">
	type Props = {
		label?: string;
	};

	let { label = 'TTS Generator · Wiraa' }: Props = $props();
</script>

<div
	aria-hidden="true"
	class="
		pointer-events-none
		absolute right-3 bottom-3
		text-[9px]
		font-semibold tracking-[0.18em]
		text-gh-light-subtle-fg
		opacity-35
		select-none
		dark:text-gh-dark-subtle-fg
	"
>
	{label.toUpperCase()}
</div>
