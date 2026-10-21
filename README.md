# TTS Generator

Generator teka-teki silang (TTS) dari daftar soal dan jawaban. Berjalan sepenuhnya di browser: layout dibuat otomatis, draft dan riwayat versi disimpan di `localStorage`, dan hasilnya bisa diunduh sebagai PDF (beberapa mode A4/A3), PNG, atau DOCX. Soal juga bisa diimport dari CSV, XLSX, atau DOCX.

Dibangun dengan SvelteKit (Svelte 5 runes), TypeScript, dan Tailwind CSS v4.

## Development

Butuh [Bun](https://bun.sh) 1.3+.

```sh
bun install
bun run dev
```

| Script           | Fungsi                            |
| ---------------- | --------------------------------- |
| `bun run dev`    | Dev server                        |
| `bun run build`  | Build production                  |
| `bun run check`  | Type check (`svelte-check`)       |
| `bun run lint`   | Prettier check + ESLint           |
| `bun run format` | Format semua file dengan Prettier |
| `bun run test`   | Unit test (Vitest, sekali jalan)  |

CI (`.github/workflows/ci.yml`) menjalankan lint, check, test, dan build untuk setiap push ke `main` dan setiap PR.

## Struktur

```
src/
├── routes/+page.svelte                 # Merangkai komponen; state ada di CrosswordSession
├── lib/
│   ├── components/                     # UI umum (Icon, ThemeSwitcher, footer)
│   ├── theme/                          # Light/dark/system theme
│   ├── utils/download.ts               # Helper download Blob & timestamp nama file
│   └── features/crossword/
│       ├── crossword-session.svelte.ts # State + alur kerja editor (autosave, generate, history, import, download)
│       ├── crossword-generator.ts      # Generator layout (pure, tanpa DOM/storage)
│       ├── crossword-pdf-modes.ts      # Registry mode PDF: label, orientasi, halaman, nama file
│       ├── crossword-export.pdf.ts     # Render PDF (pdf-lib, dimuat dinamis)
│       ├── crossword-image-export.ts   # Render PNG via canvas
│       ├── crossword-docx-export.ts    # Export soal ke DOCX
│       ├── crossword.persistence.ts    # Draft & history di localStorage
│       ├── import/                     # Parser CSV/XLSX/DOCX + validasi import
│       └── components/                 # Komponen UI fitur crossword
```

## Menambah mode PDF

1. Tambahkan nama mode ke union `CrosswordPdfMode` di `crossword-export.types.ts`.
2. Tambahkan entri di `CROSSWORD_PDF_MODES` (`crossword-pdf-modes.ts`): label, `layoutMode`, daftar `pages`, dan suffix nama file.

Toolbar, orientasi generator, dan renderer PDF otomatis mengikuti registry. TypeScript akan error bila mode baru belum didaftarkan, dan `crossword-export.pdf.spec.ts` memverifikasi ukuran halaman setiap mode.
