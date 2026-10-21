export function triggerBlobDownload(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);

	const anchor = document.createElement('a');

	anchor.href = url;
	anchor.download = fileName;
	anchor.rel = 'noreferrer';

	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();

	// Revoke di tick berikutnya; revoke langsung bisa membatalkan download di sebagian browser.
	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 0);
}

/**
 * Format `YYYY-MM-DD-HHmm` (atau `YYYY-MM-DD-HHmmss`) untuk nama file.
 */
export function createFileTimestamp(date = new Date(), { withSeconds = false } = {}): string {
	const pad = (value: number): string => String(value).padStart(2, '0');

	const day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');

	const time = `${pad(date.getHours())}${pad(date.getMinutes())}${withSeconds ? pad(date.getSeconds()) : ''}`;

	return `${day}-${time}`;
}
