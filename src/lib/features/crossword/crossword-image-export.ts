import type {
	CrosswordLayout,
	CrosswordPreviewMode
} from '$lib/features/crossword/crossword.types';

const EXPORT_CELL_SIZE = 64;

const EXPORT_PADDING = 72;

const EXPORT_HEADER_HEIGHT = 96;

const EXPORT_SCALE = 2;

const BACKGROUND_COLOR = '#ffffff';

const FOREGROUND_COLOR = '#111111';

const MUTED_COLOR = '#57606a';

const BORDER_COLOR = '#111111';

type DownloadCrosswordImageOptions = {
	layout: CrosswordLayout;

	mode: CrosswordPreviewMode;
};

function createExportFileName(mode: CrosswordPreviewMode): string {
	const now = new Date();

	const pad = (value: number): string => String(value).padStart(2, '0');

	const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');

	const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

	const modeName = mode === 'answer' ? 'answer-key' : 'puzzle';

	return `tts-${modeName}-${date}-${time}.png`;
}

function getModeTitle(mode: CrosswordPreviewMode): string {
	return mode === 'answer' ? 'Kunci Jawaban' : 'Teka-Teki Silang';
}

function getCanvasDimensions(layout: CrosswordLayout): {
	width: number;
	height: number;
} {
	return {
		width: EXPORT_PADDING * 2 + layout.width * EXPORT_CELL_SIZE,

		height: EXPORT_PADDING * 2 + EXPORT_HEADER_HEIGHT + layout.height * EXPORT_CELL_SIZE
	};
}

function createExportCanvas(
	width: number,
	height: number
): {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
} {
	const canvas = document.createElement('canvas');

	canvas.width = width * EXPORT_SCALE;

	canvas.height = height * EXPORT_SCALE;

	canvas.style.width = `${width}px`;

	canvas.style.height = `${height}px`;

	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Canvas tidak tersedia pada browser ini.');
	}

	/*
	 * Render di resolusi tinggi supaya angka,
	 * huruf dan garis tetap tajam.
	 */
	context.scale(EXPORT_SCALE, EXPORT_SCALE);

	context.imageSmoothingEnabled = true;

	return {
		canvas,
		context
	};
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number): void {
	context.fillStyle = BACKGROUND_COLOR;

	context.fillRect(0, 0, width, height);
}

function drawHeader(context: CanvasRenderingContext2D, mode: CrosswordPreviewMode): void {
	context.fillStyle = FOREGROUND_COLOR;

	context.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

	context.textAlign = 'left';

	context.textBaseline = 'top';

	context.fillText(getModeTitle(mode), EXPORT_PADDING, EXPORT_PADDING);

	context.fillStyle = MUTED_COLOR;

	context.font = '400 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

	context.fillText(
		mode === 'answer' ? 'TTS Generator · Answer key' : 'TTS Generator · Puzzle',
		EXPORT_PADDING,
		EXPORT_PADDING + 42
	);
}

function drawCellNumber(
	context: CanvasRenderingContext2D,
	numbers: number[],
	x: number,
	y: number
): void {
	const text = numbers.join('/');

	context.fillStyle = FOREGROUND_COLOR;

	context.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

	context.textAlign = 'left';

	context.textBaseline = 'top';

	context.fillText(text, x + 4, y + 3);
}

function drawCellLetter(
	context: CanvasRenderingContext2D,
	letter: string,
	x: number,
	y: number
): void {
	context.fillStyle = FOREGROUND_COLOR;

	context.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

	context.textAlign = 'center';

	context.textBaseline = 'middle';

	context.fillText(letter, x + EXPORT_CELL_SIZE / 2, y + EXPORT_CELL_SIZE / 2 + 3);
}

function drawCrosswordGrid(
	context: CanvasRenderingContext2D,
	layout: CrosswordLayout,
	mode: CrosswordPreviewMode
): void {
	const startX = EXPORT_PADDING;

	const startY = EXPORT_PADDING + EXPORT_HEADER_HEIGHT;

	context.lineWidth = 1.5;

	context.strokeStyle = BORDER_COLOR;

	context.fillStyle = BACKGROUND_COLOR;

	for (const cell of layout.cells) {
		const x = startX + cell.x * EXPORT_CELL_SIZE;

		const y = startY + cell.y * EXPORT_CELL_SIZE;

		context.fillStyle = BACKGROUND_COLOR;

		context.fillRect(x, y, EXPORT_CELL_SIZE, EXPORT_CELL_SIZE);

		/*
		 * Offset 0.75 membantu line 1.5px
		 * terlihat lebih crisp di canvas.
		 */
		context.strokeRect(x + 0.75, y + 0.75, EXPORT_CELL_SIZE - 1.5, EXPORT_CELL_SIZE - 1.5);

		if (cell.numbers && cell.numbers.length > 0) {
			drawCellNumber(context, cell.numbers, x, y);
		}

		if (mode === 'answer') {
			drawCellLetter(context, cell.letter, x, y);
		}
	}
}

function drawWatermark(context: CanvasRenderingContext2D, width: number, height: number): void {
	context.fillStyle = MUTED_COLOR;

	context.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

	context.textAlign = 'right';

	context.textBaseline = 'bottom';

	context.fillText('TTS Generator · Wiraa', width - EXPORT_PADDING, height - 24);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error('Gambar PNG gagal dibuat.'));

					return;
				}

				resolve(blob);
			},
			'image/png',
			1
		);
	});
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);

	const anchor = document.createElement('a');

	anchor.href = url;

	anchor.download = fileName;

	anchor.rel = 'noreferrer';

	document.body.appendChild(anchor);

	anchor.click();

	anchor.remove();

	/*
	 * Jangan revoke sebelum browser sempat
	 * mengambil Blob URL.
	 */
	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 0);
}

/**
 * Export crossword grid menjadi high-resolution PNG.
 *
 * Tidak menangkap DOM sehingga:
 * - theme dark/light tidak memengaruhi hasil;
 * - hasil selalu print-friendly;
 * - tidak membutuhkan html2canvas;
 * - layout mengikuti data generator secara deterministik.
 */
export async function downloadCrosswordImage({
	layout,
	mode
}: DownloadCrosswordImageOptions): Promise<void> {
	if (layout.cells.length === 0 || layout.width <= 0 || layout.height <= 0) {
		throw new Error('Crossword belum tersedia untuk didownload.');
	}

	const { width, height } = getCanvasDimensions(layout);

	const { canvas, context } = createExportCanvas(width, height);

	drawBackground(context, width, height);

	drawHeader(context, mode);

	drawCrosswordGrid(context, layout, mode);

	drawWatermark(context, width, height);

	const blob = await canvasToBlob(canvas);

	triggerBlobDownload(blob, createExportFileName(mode));
}
