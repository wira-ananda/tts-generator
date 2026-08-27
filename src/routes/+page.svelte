<script lang="ts">
	import { FileUp, History, Puzzle, Save } from 'lucide-svelte';

	import ThemeSwitcher from '$lib/components/ui/ThemeSwitcher.svelte';
</script>

<svelte:head>
	<title>TTS Generator</title>
	<meta
		name="description"
		content="Buat teka-teki silang secara otomatis dari kumpulan soal dan jawaban."
	/>
</svelte:head>

<div class="min-h-dvh bg-canvas-default text-fg-default">
	<header class="border-b border-border-default bg-canvas-default">
		<div class="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
			<div class="flex min-w-0 items-center gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-fg-default text-canvas-default"
				>
					<Puzzle size={18} strokeWidth={2} />
				</div>

				<div class="min-w-0">
					<h1 class="truncate text-sm font-semibold text-fg-default">TTS Generator</h1>
					<p class="hidden text-xs text-fg-muted sm:block">Crossword puzzle generator</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					class="
						inline-flex h-8 items-center gap-2 rounded-md
						border border-border-default bg-button-default
						px-3 text-sm font-medium text-fg-default
						shadow-button
						transition-colors
						hover:bg-button-hover
						focus-visible:ring-2
						focus-visible:ring-focus focus-visible:outline-none
					"
				>
					<History size={16} />
					<span class="hidden sm:inline">History</span>
				</button>

				<button
					type="button"
					class="
						inline-flex h-8 items-center gap-2 rounded-md
						border border-border-default bg-button-default
						px-3 text-sm font-medium text-fg-default
						shadow-button
						transition-colors
						hover:bg-button-hover
						focus-visible:ring-2
						focus-visible:ring-focus focus-visible:outline-none
					"
				>
					<FileUp size={16} />
					<span class="hidden sm:inline">Import</span>
				</button>

				<ThemeSwitcher />
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
		<div class="mb-5">
			<h2 class="text-xl font-semibold tracking-tight text-fg-default">Generator</h2>
			<p class="mt-1 text-sm text-fg-muted">
				Masukkan soal dan jawaban untuk membuat teka-teki silang secara otomatis.
			</p>
		</div>

		<div class="grid gap-4 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
			<section class="overflow-hidden rounded-md border border-border-default bg-canvas-default">
				<header
					class="flex min-h-14 items-center justify-between gap-4 border-b border-border-default px-4"
				>
					<div>
						<h3 class="text-sm font-semibold text-fg-default">Questions</h3>
						<p class="text-xs text-fg-muted">0 / 150 questions</p>
					</div>

					<button
						type="button"
						class="
							inline-flex h-8 items-center gap-2 rounded-md
							border border-border-default bg-button-default
							px-3 text-sm font-medium text-fg-default
							shadow-button
							transition-colors
							hover:bg-button-hover
							focus-visible:ring-2
							focus-visible:ring-focus focus-visible:outline-none
						"
					>
						Add question
					</button>
				</header>

				<div class="min-h-[520px] p-4">
					<div
						class="
							flex min-h-[488px] items-center justify-center
							rounded-md border border-dashed border-border-default
							bg-canvas-subtle p-6 text-center
						"
					>
						<div class="max-w-sm">
							<Puzzle size={32} strokeWidth={1.5} class="mx-auto mb-3 text-fg-subtle" />

							<p class="text-sm font-medium text-fg-default">Question editor will appear here</p>
							<p class="mt-1 text-xs leading-5 text-fg-muted">
								Pada tahap berikutnya kita akan menambahkan 10 form awal dan maksimal 150 soal.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="overflow-hidden rounded-md border border-border-default bg-canvas-default">
				<header
					class="flex min-h-14 items-center justify-between gap-4 border-b border-border-default px-4"
				>
					<div>
						<h3 class="text-sm font-semibold text-fg-default">Preview</h3>
						<p class="text-xs text-fg-muted">Crossword preview</p>
					</div>

					<div
						class="
							inline-flex h-8 items-center rounded-md
							border border-border-default bg-canvas-subtle
							p-0.5
						"
					>
						<button type="button" class="h-6 rounded px-2.5 text-xs font-medium text-fg-default">
							Puzzle
						</button>

						<button type="button" class="h-6 rounded px-2.5 text-xs font-medium text-fg-muted">
							Answer key
						</button>
					</div>
				</header>

				<div class="min-h-[520px] p-4">
					<div
						class="
							flex min-h-[488px] items-center justify-center
							overflow-auto rounded-md
							border border-border-muted bg-canvas-subtle p-6
						"
					>
						<div class="text-center">
							<div
								class="
									mx-auto mb-3 flex size-10 items-center justify-center
									rounded-md border border-border-default bg-canvas-default
								"
							>
								<Puzzle size={20} class="text-fg-muted" />
							</div>

							<p class="text-sm font-medium text-fg-default">No crossword yet</p>
							<p class="mt-1 text-xs text-fg-muted">
								Preview akan tetap menggunakan area ini agar layout tidak bergeser.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>

		<div
			class="
				mt-4 flex min-h-12 flex-col gap-3 rounded-md
				border border-border-default bg-canvas-subtle
				px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between
			"
		>
			<div class="flex items-center gap-2 text-xs text-fg-muted">
				<Save size={15} />
				<span>Draft akan tersimpan otomatis di browser.</span>
			</div>

			<button
				type="button"
				disabled
				class="
					inline-flex h-8 items-center justify-center rounded-md
					border border-border-default bg-button-default
					px-3 text-sm font-medium text-fg-muted
					opacity-60 shadow-button
				"
			>
				Download PDF
			</button>
		</div>
	</main>
</div>
