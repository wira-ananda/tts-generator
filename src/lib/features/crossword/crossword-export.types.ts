export type CrosswordDownloadState = 'never' | 'current' | 'stale';

export type CrosswordDownloadMeta = {
	version: 1;

	signature: string;

	downloadedAt: string;

	fileName: string;
};

export type CrosswordExportReadiness = {
	ready: boolean;

	reason: string | null;

	activeEntryCount: number;
};

export type CrosswordPdfResult = {
	fileName: string;

	downloadedAt: string;
};
