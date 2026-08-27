export type CrosswordEntryField = 'clue' | 'answer';

export type CrosswordEntry = {
	id: string;
	clue: string;
	answer: string;
};

export type CrosswordDirection = 'across' | 'down';

export type CrosswordPreviewMode = 'puzzle' | 'answer';

export type CrosswordUnplacedReason =
	'invalid-answer' | 'duplicate-answer' | 'no-intersection' | 'no-valid-placement';

export type CrosswordPlacement = {
	entryId: string;

	/**
	 * Nomor selalu mengikuti posisi Question pada editor.
	 *
	 * Question 1 → number 1
	 * Question 7 → number 7
	 */
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

	/**
	 * Satu cell dapat menjadi starting point lebih dari satu answer.
	 *
	 * Contoh:
	 * Question 1 Across
	 * Question 3 Down
	 *
	 * keduanya mulai pada cell yang sama.
	 */
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

	unplacedEntryIds: string[];

	unplacedEntries: CrosswordUnplacedEntry[];

	width: number;
	height: number;

	intersectionCount: number;
};

export type CrosswordGeneratorOptions = {
	attempts?: number;
};
