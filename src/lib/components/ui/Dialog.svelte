<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open: boolean;
		onClose: () => void;
		labelledby: string;
		/** Ukuran panel, mis. `max-w-2xl max-h-[80dvh]`. */
		class?: string;
		children: Snippet;
	};

	let { open, onClose, labelledby, class: className = '', children }: Props = $props();

	let dialog = $state<HTMLDialogElement>();

	// showModal() memberi focus trap, Escape, dan pengembalian fokus dari browser.
	$effect(() => {
		if (!dialog) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function handleCancel(event: Event): void {
		// State `open` dikontrol parent; jangan biarkan browser menutup sendiri.
		event.preventDefault();

		onClose();
	}

	function handleClick(event: MouseEvent): void {
		// Konten mengisi seluruh panel, jadi target === dialog hanya saat klik backdrop.
		if (event.target === dialog) {
			onClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={labelledby}
	class={[
		'm-auto w-[calc(100%-2rem)] overflow-hidden rounded-md border border-gh-light-border bg-gh-light-overlay shadow-gh-overlay-light backdrop:bg-black/55 open:flex open:flex-col dark:border-gh-dark-border dark:bg-gh-dark-overlay dark:shadow-gh-overlay-dark',
		className
	]}
	oncancel={handleCancel}
	onclick={handleClick}
>
	{#if open}
		<div class="flex min-h-0 w-full flex-1 flex-col">
			{@render children()}
		</div>
	{/if}
</dialog>
