export type CrosswordEntryField = 'clue' | 'answer';

export type CrosswordEntry = {
	id: string;
	clue: string;
	answer: string;
};

export type CrosswordDirection = 'across' | 'down';

export type CrosswordPreviewMode = 'puzzle' | 'answer';

export type CrosswordUnplacedReason = 'invalid-answer' | 'no-intersection' | 'no-valid-placement';

export type CrosswordPlacement = {
	entryId: string;

	/** Sama dengan posisi soal di editor (soal ke-7 → 7). */
	number: number;

	answer: string;

	x: number;
	y: number;

	direction: CrosswordDirection;

	intersections: number;
};

export type CrosswordCell = {
	x: number;
	y: number;

	letter: string;

	/** Bisa lebih dari satu bila beberapa soal mulai di cell yang sama. */
	numbers?: number[];

	acrossEntryId?: string;
	downEntryId?: string;
};

export type CrosswordUnplacedEntry = {
	entryId: string;
	answer: string;
	reason: CrosswordUnplacedReason;
};

export type CrosswordLayout = {
	placements: CrosswordPlacement[];

	cells: CrosswordCell[];

	unplacedEntries: CrosswordUnplacedEntry[];

	width: number;
	height: number;

	intersectionCount: number;
};

export type CrosswordLayoutMode = 'landscape' | 'portrait';

export type CrosswordGeneratorOptions = {
	attempts?: number;
	layoutMode?: CrosswordLayoutMode;
};
