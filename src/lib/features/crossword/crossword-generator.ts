import type {
	CrosswordCell,
	CrosswordDirection,
	CrosswordEntry,
	CrosswordGeneratorOptions,
	CrosswordLayout,
	CrosswordPlacement,
	CrosswordUnplacedEntry
} from '$lib/features/crossword/crossword.types';

import {
	createEmptyCrosswordLayout,
	normalizeAnswer
} from '$lib/features/crossword/crossword.utils';

type PreparedEntry = {
	entry: CrosswordEntry;

	/**
	 * Nomor mengikuti posisi entry pada editor.
	 */
	questionNumber: number;

	answer: string;

	originalIndex: number;
};

type WorkingCell = {
	x: number;
	y: number;

	letter: string;

	acrossEntryId?: string;
	downEntryId?: string;
};

type WorkingPlacement = {
	entryId: string;

	questionNumber: number;

	answer: string;

	x: number;
	y: number;

	direction: CrosswordDirection;

	intersections: number;
};

type PlacementCandidate = {
	x: number;
	y: number;

	direction: CrosswordDirection;

	intersections: number;

	score: number;
};

type GridBounds = {
	minX: number;
	maxX: number;

	minY: number;
	maxY: number;

	width: number;
	height: number;
};

type AttemptResult = {
	layout: CrosswordLayout;
	score: number;
};

type PreparedEntriesResult = {
	entries: PreparedEntry[];

	baseUnplaced: CrosswordUnplacedEntry[];
};

type WorkingGrid = Map<string, WorkingCell>;

const INTERSECTION_SCORE = 10_000;

/**
 * Halaman grid selalu dicetak di kertas A3 landscape (lebih lebar
 * daripada tinggi). Grid yang bentuknya juga lebih lebar daripada
 * tinggi memanfaatkan kertas itu lebih baik — cell-nya bisa jauh
 * lebih besar dibanding grid yang bentuknya kotak/tinggi.
 *
 * Makanya pertumbuhan ke arah tinggi diberi penalty jauh lebih besar
 * daripada pertumbuhan ke arah lebar, supaya kalau ada pilihan antara
 * menempatkan entry baru dengan meperlebar grid vs mempertinggi grid
 * (intersection count-nya sama), generator lebih milih yang
 * memperlebar.
 */
const WIDTH_GROWTH_PENALTY = 10;

const HEIGHT_GROWTH_PENALTY = 35;

const CENTER_DISTANCE_PENALTY = 2;

/**
 * Sparse coordinate key.
 */
function createCellKey(x: number, y: number): string {
	return `${x}:${y}`;
}

/**
 * Mendapatkan coordinate huruf berdasarkan start dan direction.
 */
function getCoordinates(
	startX: number,
	startY: number,
	direction: CrosswordDirection,
	index: number
): {
	x: number;
	y: number;
} {
	if (direction === 'across') {
		return {
			x: startX + index,

			y: startY
		};
	}

	return {
		x: startX,

		y: startY + index
	};
}

/**
 * Mengambil bounding box sparse grid.
 */
function getGridBounds(grid: WorkingGrid): GridBounds | null {
	if (grid.size === 0) {
		return null;
	}

	let minX = Infinity;
	let maxX = -Infinity;

	let minY = Infinity;
	let maxY = -Infinity;

	for (const cell of grid.values()) {
		minX = Math.min(minX, cell.x);

		maxX = Math.max(maxX, cell.x);

		minY = Math.min(minY, cell.y);

		maxY = Math.max(maxY, cell.y);
	}

	return {
		minX,
		maxX,

		minY,
		maxY,

		width: maxX - minX + 1,

		height: maxY - minY + 1
	};
}

/**
 * Memastikan candidate tidak melanggar rule crossword.
 */
function validatePlacementCandidate(
	grid: WorkingGrid,
	answer: string,
	startX: number,
	startY: number,
	direction: CrosswordDirection,
	requireIntersection: boolean
): {
	valid: boolean;
	intersections: number;
} {
	const deltaX = direction === 'across' ? 1 : 0;

	const deltaY = direction === 'down' ? 1 : 0;

	const beforeKey = createCellKey(
		startX - deltaX,

		startY - deltaY
	);

	const afterKey = createCellKey(
		startX + deltaX * answer.length,

		startY + deltaY * answer.length
	);

	/*
	 * Kata tidak boleh langsung tersambung
	 * pada ujung kata lain.
	 */
	if (grid.has(beforeKey) || grid.has(afterKey)) {
		return {
			valid: false,
			intersections: 0
		};
	}

	let intersections = 0;

	for (let index = 0; index < answer.length; index += 1) {
		const { x, y } = getCoordinates(startX, startY, direction, index);

		const key = createCellKey(x, y);

		const letter = answer.charAt(index);

		const existingCell = grid.get(key);

		if (existingCell) {
			if (existingCell.letter !== letter) {
				return {
					valid: false,
					intersections: 0
				};
			}

			/*
			 * Satu cell tidak boleh mempunyai dua
			 * horizontal word atau dua vertical word.
			 */
			if (direction === 'across' && existingCell.acrossEntryId) {
				return {
					valid: false,
					intersections: 0
				};
			}

			if (direction === 'down' && existingCell.downEntryId) {
				return {
					valid: false,
					intersections: 0
				};
			}

			intersections += 1;

			continue;
		}

		/*
		 * Cell baru tidak boleh menempel pada huruf
		 * lain dari sisi perpendicular.
		 */
		if (direction === 'across') {
			if (grid.has(createCellKey(x, y - 1)) || grid.has(createCellKey(x, y + 1))) {
				return {
					valid: false,
					intersections: 0
				};
			}
		} else {
			if (grid.has(createCellKey(x - 1, y)) || grid.has(createCellKey(x + 1, y))) {
				return {
					valid: false,
					intersections: 0
				};
			}
		}
	}

	if (requireIntersection && intersections === 0) {
		return {
			valid: false,
			intersections: 0
		};
	}

	return {
		valid: true,
		intersections
	};
}

/**
 * Candidate dengan intersection lebih banyak diprioritaskan.
 * Layout yang memperbesar bounding box diberi penalty.
 */
function calculateCandidateScore(
	grid: WorkingGrid,
	answer: string,
	startX: number,
	startY: number,
	direction: CrosswordDirection,
	intersections: number
): number {
	const currentBounds = getGridBounds(grid);

	if (!currentBounds) {
		return 0;
	}

	const endCoordinates = getCoordinates(startX, startY, direction, answer.length - 1);

	const candidateMinX = Math.min(startX, endCoordinates.x);

	const candidateMaxX = Math.max(startX, endCoordinates.x);

	const candidateMinY = Math.min(startY, endCoordinates.y);

	const candidateMaxY = Math.max(startY, endCoordinates.y);

	const nextMinX = Math.min(currentBounds.minX, candidateMinX);

	const nextMaxX = Math.max(currentBounds.maxX, candidateMaxX);

	const nextMinY = Math.min(currentBounds.minY, candidateMinY);

	const nextMaxY = Math.max(currentBounds.maxY, candidateMaxY);

	const nextWidth = nextMaxX - nextMinX + 1;

	const nextHeight = nextMaxY - nextMinY + 1;

	const widthGrowth = Math.max(0, nextWidth - currentBounds.width);

	const heightGrowth = Math.max(0, nextHeight - currentBounds.height);

	const centerX = (nextMinX + nextMaxX) / 2;

	const centerY = (nextMinY + nextMaxY) / 2;

	const centerDistance = Math.abs(centerX) + Math.abs(centerY);

	return (
		intersections * INTERSECTION_SCORE -
		widthGrowth * WIDTH_GROWTH_PENALTY -
		heightGrowth * HEIGHT_GROWTH_PENALTY -
		centerDistance * CENTER_DISTANCE_PENALTY
	);
}

/**
 * Mencari seluruh placement candidate valid.
 */
function findPlacementCandidates(grid: WorkingGrid, answer: string): PlacementCandidate[] {
	const candidates: PlacementCandidate[] = [];

	const seenCandidates = new Set<string>();

	for (const cell of grid.values()) {
		for (let letterIndex = 0; letterIndex < answer.length; letterIndex += 1) {
			if (answer.charAt(letterIndex) !== cell.letter) {
				continue;
			}

			const possibleDirections: CrosswordDirection[] = [];

			/*
			 * Jika cell berasal dari Across,
			 * kandidat baru hanya boleh Down.
			 */
			if (cell.acrossEntryId && !cell.downEntryId) {
				possibleDirections.push('down');
			}

			/*
			 * Jika cell berasal dari Down,
			 * kandidat baru hanya boleh Across.
			 */
			if (cell.downEntryId && !cell.acrossEntryId) {
				possibleDirections.push('across');
			}

			for (const direction of possibleDirections) {
				const startX = direction === 'across' ? cell.x - letterIndex : cell.x;

				const startY = direction === 'down' ? cell.y - letterIndex : cell.y;

				const candidateKey = `${startX}:${startY}:${direction}`;

				if (seenCandidates.has(candidateKey)) {
					continue;
				}

				seenCandidates.add(candidateKey);

				const validation = validatePlacementCandidate(
					grid,
					answer,
					startX,
					startY,
					direction,
					true
				);

				if (!validation.valid) {
					continue;
				}

				candidates.push({
					x: startX,

					y: startY,

					direction,

					intersections: validation.intersections,

					score: calculateCandidateScore(
						grid,
						answer,
						startX,
						startY,
						direction,
						validation.intersections
					)
				});
			}
		}
	}

	return candidates.sort((first, second) => {
		if (first.score !== second.score) {
			return second.score - first.score;
		}

		if (first.intersections !== second.intersections) {
			return second.intersections - first.intersections;
		}

		if (first.y !== second.y) {
			return first.y - second.y;
		}

		if (first.x !== second.x) {
			return first.x - second.x;
		}

		return first.direction === 'across' ? -1 : 1;
	});
}

/**
 * Menempatkan satu answer pada sparse grid.
 */
function placeEntry(
	grid: WorkingGrid,
	preparedEntry: PreparedEntry,
	candidate: PlacementCandidate
): WorkingPlacement {
	for (let index = 0; index < preparedEntry.answer.length; index += 1) {
		const { x, y } = getCoordinates(candidate.x, candidate.y, candidate.direction, index);

		const key = createCellKey(x, y);

		const existingCell = grid.get(key);

		const nextCell: WorkingCell = existingCell
			? {
					...existingCell
				}
			: {
					x,
					y,

					letter: preparedEntry.answer.charAt(index)
				};

		if (candidate.direction === 'across') {
			nextCell.acrossEntryId = preparedEntry.entry.id;
		} else {
			nextCell.downEntryId = preparedEntry.entry.id;
		}

		grid.set(key, nextCell);
	}

	return {
		entryId: preparedEntry.entry.id,

		questionNumber: preparedEntry.questionNumber,

		answer: preparedEntry.answer,

		x: candidate.x,

		y: candidate.y,

		direction: candidate.direction,

		intersections: candidate.intersections
	};
}

/**
 * First answer menjadi anchor horizontal.
 */
function placeFirstEntry(grid: WorkingGrid, entry: PreparedEntry): WorkingPlacement {
	return placeEntry(grid, entry, {
		x: 0,
		y: 0,

		direction: 'across',

		intersections: 0,

		score: 0
	});
}

/**
 * Heuristic connectivity.
 */
function countSharedLetters(answer: string, otherAnswers: string[]): number {
	const answerLetters = new Set(answer);

	const sharedLetters = new Set<string>();

	for (const otherAnswer of otherAnswers) {
		for (const letter of answerLetters) {
			if (otherAnswer.includes(letter)) {
				sharedLetters.add(letter);
			}
		}
	}

	return sharedLetters.size;
}

/**
 * Deterministic hash untuk alternative attempts.
 */
function stableHash(value: string): number {
	let hash = 2166136261;

	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);

		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

/**
 * Membuat entry ordering berbeda tanpa randomness runtime.
 */
function orderEntriesForAttempt(entries: PreparedEntry[], attemptIndex: number): PreparedEntry[] {
	if (attemptIndex === 0) {
		return [...entries].sort(
			(first, second) =>
				second.answer.length - first.answer.length || first.originalIndex - second.originalIndex
		);
	}

	if (attemptIndex === 1) {
		const answers = entries.map((entry) => entry.answer);

		return [...entries].sort((first, second) => {
			const firstConnectivity = countSharedLetters(
				first.answer,

				answers.filter((answer) => answer !== first.answer)
			);

			const secondConnectivity = countSharedLetters(
				second.answer,

				answers.filter((answer) => answer !== second.answer)
			);

			return (
				secondConnectivity - firstConnectivity ||
				second.answer.length - first.answer.length ||
				first.originalIndex - second.originalIndex
			);
		});
	}

	const sortedByLength = [...entries].sort(
		(first, second) =>
			second.answer.length - first.answer.length || first.originalIndex - second.originalIndex
	);

	const anchor = sortedByLength[0];

	if (!anchor) {
		return [];
	}

	const remaining = sortedByLength
		.slice(1)
		.sort(
			(first, second) =>
				stableHash(`${first.entry.id}:${attemptIndex}`) -
				stableHash(`${second.entry.id}:${attemptIndex}`)
		);

	return [anchor, ...remaining];
}

/**
 * Normalize dan validate raw entries.
 *
 * Dua entry boleh punya answer yang sama persis setelah normalisasi
 * (soal berbeda, jawaban kebetulan sama) — itu bukan error. Keduanya
 * tetap dicoba ditempatkan seperti entry lain; kalau memang tidak
 * ketemu posisi yang valid, baru masuk unplaced lewat alur normal
 * (reason 'no-intersection' / 'no-valid-placement'), bukan langsung
 * ditolak di sini.
 */
function prepareEntries(entries: CrosswordEntry[]): PreparedEntriesResult {
	const preparedEntries: PreparedEntry[] = [];

	const baseUnplaced: CrosswordUnplacedEntry[] = [];

	entries.forEach((entry, originalIndex) => {
		if (entry.answer.trim() === '') {
			return;
		}

		const normalizedAnswer = normalizeAnswer(entry.answer);

		if (normalizedAnswer === '') {
			baseUnplaced.push({
				entryId: entry.id,

				answer: entry.answer,

				reason: 'invalid-answer'
			});

			return;
		}

		preparedEntries.push({
			entry,

			/*
			 * INI numbering source-of-truth.
			 *
			 * Posisi editor adalah nomor soal.
			 */
			questionNumber: originalIndex + 1,

			answer: normalizedAnswer,

			originalIndex
		});
	});

	return {
		entries: preparedEntries,

		baseUnplaced
	};
}

/**
 * Cek apakah answer minimal mempunyai huruf yang sama
 * dengan crossword saat ini.
 */
function hasLetterIntersection(grid: WorkingGrid, answer: string): boolean {
	for (const cell of grid.values()) {
		if (answer.includes(cell.letter)) {
			return true;
		}
	}

	return false;
}

/**
 * Satu greedy generation attempt.
 */
function generateWorkingAttempt(
	entries: PreparedEntry[],
	attemptIndex: number
): {
	grid: WorkingGrid;

	placements: WorkingPlacement[];

	unplaced: CrosswordUnplacedEntry[];
} {
	const grid: WorkingGrid = new Map();

	const placements: WorkingPlacement[] = [];

	const orderedEntries = orderEntriesForAttempt(entries, attemptIndex);

	const firstEntry = orderedEntries[0];

	if (!firstEntry) {
		return {
			grid,
			placements,
			unplaced: []
		};
	}

	placements.push(placeFirstEntry(grid, firstEntry));

	let pendingEntries = orderedEntries.slice(1);

	let pass = 0;

	while (pendingEntries.length > 0 && pass < entries.length) {
		const nextPending: PreparedEntry[] = [];

		let placedThisPass = 0;

		for (const entry of pendingEntries) {
			const candidates = findPlacementCandidates(grid, entry.answer);

			const bestCandidate = candidates[0];

			if (!bestCandidate) {
				nextPending.push(entry);

				continue;
			}

			placements.push(placeEntry(grid, entry, bestCandidate));

			placedThisPass += 1;
		}

		pendingEntries = nextPending;

		if (placedThisPass === 0) {
			break;
		}

		pass += 1;
	}

	const unplaced = pendingEntries.map((entry): CrosswordUnplacedEntry => ({
		entryId: entry.entry.id,

		answer: entry.answer,

		reason: hasLetterIntersection(grid, entry.answer) ? 'no-valid-placement' : 'no-intersection'
	}));

	return {
		grid,
		placements,
		unplaced
	};
}

/**
 * Convert sparse working grid menjadi final normalized layout.
 *
 * PENTING:
 * Numbering tidak dihitung ulang berdasarkan coordinate.
 *
 * Nomor berasal langsung dari Question editor.
 */
function finalizeLayout(
	grid: WorkingGrid,
	workingPlacements: WorkingPlacement[],
	unplacedEntries: CrosswordUnplacedEntry[]
): CrosswordLayout {
	const bounds = getGridBounds(grid);

	if (!bounds) {
		return {
			...createEmptyCrosswordLayout(),

			unplacedEntryIds: unplacedEntries.map((entry) => entry.entryId),

			unplacedEntries
		};
	}

	const offsetX = -bounds.minX;

	const offsetY = -bounds.minY;

	const placements: CrosswordPlacement[] = workingPlacements.map((placement) => ({
		entryId: placement.entryId,

		/*
		 * Tidak ada top-left numbering lagi.
		 */
		number: placement.questionNumber,

		answer: placement.answer,

		x: placement.x + offsetX,

		y: placement.y + offsetY,

		direction: placement.direction,

		intersections: placement.intersections
	}));

	/*
	 * Satu coordinate bisa menjadi start beberapa question.
	 *
	 * Contoh:
	 * Question 1 Across
	 * Question 3 Down
	 *
	 * Cell menyimpan [1, 3].
	 */
	const numbersByCoordinate = new Map<string, number[]>();

	for (const placement of placements) {
		const key = createCellKey(placement.x, placement.y);

		const currentNumbers = numbersByCoordinate.get(key) ?? [];

		if (!currentNumbers.includes(placement.number)) {
			currentNumbers.push(placement.number);
		}

		currentNumbers.sort((first, second) => first - second);

		numbersByCoordinate.set(key, currentNumbers);
	}

	const cells: CrosswordCell[] = Array.from(grid.values()).map((cell) => {
		const x = cell.x + offsetX;

		const y = cell.y + offsetY;

		const numbers = numbersByCoordinate.get(createCellKey(x, y));

		const normalizedCell: CrosswordCell = {
			x,
			y,

			letter: cell.letter
		};

		if (numbers && numbers.length > 0) {
			normalizedCell.numbers = [...numbers];
		}

		if (cell.acrossEntryId) {
			normalizedCell.acrossEntryId = cell.acrossEntryId;
		}

		if (cell.downEntryId) {
			normalizedCell.downEntryId = cell.downEntryId;
		}

		return normalizedCell;
	});

	cells.sort((first, second) => first.y - second.y || first.x - second.x);

	const intersectionCount = cells.filter((cell) =>
		Boolean(cell.acrossEntryId && cell.downEntryId)
	).length;

	return {
		placements,

		cells,

		unplacedEntryIds: unplacedEntries.map((entry) => entry.entryId),

		unplacedEntries,

		width: bounds.width,

		height: bounds.height,

		intersectionCount
	};
}

/**
 * Score antar attempt.
 *
 * Height dipenalti lebih berat daripada width supaya layout yang
 * lebih lebar (cocok untuk kertas A3 landscape) selalu diprioritaskan
 * dibanding layout yang bentuknya kotak/tinggi, walau area totalnya
 * sama.
 */
function calculateLayoutScore(layout: CrosswordLayout): number {
	const placedScore = layout.placements.length * 1_000_000;

	const intersectionScore = layout.intersectionCount * 10_000;

	const area = layout.width * layout.height;

	return placedScore + intersectionScore - area * 10 - layout.width - layout.height * 3;
}

/**
 * Unplaced list tetap mengikuti urutan Question editor.
 */
function sortUnplacedEntries(
	unplacedEntries: CrosswordUnplacedEntry[],
	entries: CrosswordEntry[]
): CrosswordUnplacedEntry[] {
	const orderById = new Map(entries.map((entry, index) => [entry.id, index]));

	return [...unplacedEntries].sort(
		(first, second) =>
			(orderById.get(first.entryId) ?? Infinity) - (orderById.get(second.entryId) ?? Infinity)
	);
}

/**
 * Pure crossword generator.
 *
 * Tidak mengakses DOM, browser, localStorage,
 * ataupun Svelte state.
 */
export function buildCrosswordLayout(
	entries: CrosswordEntry[],
	options: CrosswordGeneratorOptions = {}
): CrosswordLayout {
	const {
		entries: preparedEntries,

		baseUnplaced
	} = prepareEntries(entries);

	if (preparedEntries.length === 0) {
		const sortedUnplaced = sortUnplacedEntries(baseUnplaced, entries);

		return {
			...createEmptyCrosswordLayout(),

			unplacedEntryIds: sortedUnplaced.map((entry) => entry.entryId),

			unplacedEntries: sortedUnplaced
		};
	}

	const attempts = Math.max(1, Math.floor(options.attempts ?? 1));

	let bestResult: AttemptResult | null = null;

	for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex += 1) {
		const attempt = generateWorkingAttempt(preparedEntries, attemptIndex);

		const unplaced = sortUnplacedEntries([...baseUnplaced, ...attempt.unplaced], entries);

		const layout = finalizeLayout(attempt.grid, attempt.placements, unplaced);

		const score = calculateLayoutScore(layout);

		if (!bestResult || score > bestResult.score) {
			bestResult = {
				layout,
				score
			};
		}
	}

	return bestResult?.layout ?? createEmptyCrosswordLayout();
}
