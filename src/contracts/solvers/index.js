import ObjectSet from '/lib/objectSet.js';
import * as algorithmicStockTrader from './algorithmicStockTrader.js';
import solveFindAllValidMathExpressions, { unitTests as testFindAllValidMathExpressions, unitTests } from './findAllValidMathExpressions';
import solveSanitizeParenthesisInExpression, { unitTests as testSanitizeParenthesisInExpression } from './sanitizeParenthesesInExpression';
import solveSquareRoot, { unitTests as testSquareRoot } from './squareRoot';
import solveSubarrayWithMaximumSum, { unitTests as testSubarrayWithMaximumSum } from './subarrayWithMaximumSum';
import * as totalWaysToSum from './totalWaysToSum.js';

export default [
	{ name: 'Algorithmic Stock Trader I', shortcut: 'ast1', method: algorithmicStockTrader.solve1, unitTests: algorithmicStockTrader.unitTests },
	{ name: 'Algorithmic Stock Trader II', shortcut: 'ast2', method: algorithmicStockTrader.solve2 },
	{ name: 'Algorithmic Stock Trader III', shortcut: 'ast3', method: algorithmicStockTrader.solve3 },
	{ name: 'Algorithmic Stock Trader IV', shortcut: 'ast4', method: algorithmicStockTrader.solve4 },
	{ name: 'Array Jumping Game', shortcut: 'ajg', method: arrayJumpingGame },
	{ name: 'Array Jumping Game II', shortcut: 'ajg2', method: arrayJumpingGame2 },
	{ name: 'Compression I: RLE Compression', shortcut: 'c1rc', method: compression1RLECompression },
	{ name: 'Compression II: LZ Decompression', shortcut: 'c2ld', method: compression2LZDecompression },
	{ name: 'Compression III: LZ Compression', shortcut: 'c3lc', method: compression3LZCompression },
	{ name: 'Encryption I: Caesar Cipher', shortcut: 'e1cc', method: encryption1CaesarCipher },
	{ name: 'Encryption II: Vigenère Cipher', shortcut: 'e2vc', method: encryption2VigenereCipher },
	{ name: 'Find All Valid Math Expressions', shortcut: 'favme', method: solveFindAllValidMathExpressions, unitTests: testFindAllValidMathExpressions },
	{ name: 'Find Largest Prime Factor', shortcut: 'flpf', method: findLargestPrimeFactor },
	{ name: 'Generate IP Addresses', shortcut: 'gia', method: generateIPAddresses },
	{ name: 'HammingCodes: Encoded Binary to Integer', shortcut: 'hebi', method: hammingcodesEncodedBinarytoInteger },
	{ name: 'HammingCodes: Integer to Encoded Binary', shortcut: 'hieb', method: hammingcodesIntegertoEncodedBinary },
	{ name: 'Merge Overlapping Intervals', shortcut: 'moi', method: mergeOverlappingIntervals },
	{ name: 'Minimum Path Sum in a Triangle', shortcut: 'mpst', method: minimumPathSuminaTriangle },
	{ name: 'Proper 2-Coloring of a Graph', shortcut: 'p2g', method: proper2ColoringofaGraph },
	{ name: 'Sanitize Parentheses in Expression', shortcut: 'spe', method: solveSanitizeParenthesisInExpression, unitTests: testSanitizeParenthesisInExpression },
	{ name: 'Shortest Path in a Grid', shortcut: 'spg', method: shortestPathinaGrid },
	{ name: 'Spiralize Matrix', shortcut: 'sm', method: spiralizeMatrix },
	{ name: 'Square Root', shortcut: 'sr', method: solveSquareRoot, unitTests: testSquareRoot },
	{ name: 'Subarray with Maximum Sum', shortcut: 'swms', method: solveSubarrayWithMaximumSum, unitTests: testSubarrayWithMaximumSum },
	{ name: 'Total Ways to Sum', shortcut: 'tws', method: totalWaysToSum.solve1, unitTests: totalWaysToSum.unitTests },
	{ name: 'Total Ways to Sum II', shortcut: 'tws2', method: totalWaysToSum.solve2 },
	{ name: 'Unique Paths in a Grid I', shortcut: 'upg1', method: uniquePathsinaGrid1 },
	{ name: 'Unique Paths in a Grid II', shortcut: 'upg2', method: uniquePathsinaGrid2 },
];


// Array Jumping Game
export async function arrayJumpingGame(ns, inputs, logger = () => {}) {
	const CAN = 1;
	const NOT = 0;

	/** PASSED **/
	if (!inputs || !inputs.length)
		return NOT;
	if (inputs.length === 1)
		return CAN;

	return canReachElement(inputs, inputs.length -1) ? CAN : NOT;

	function canReachElement(array, end) {
		if (end === 0)
			return true;
		const canReach = [...getAllThatCanReach(array, end)];
		return canReach.length > 0
			&& (canReach[0] === 0
				|| canReach.reduce((p, element) => p || canReachElement(array, element), false));
	}

	function* getAllThatCanReach(array, element) {
		for (let i = element - 1; i >= 0; i--) {
			const distance = element - i;
			if (array[i] >= distance)
				yield i;
		}
	}
}


// Array Jumping Game II
export async function arrayJumpingGame2(ns, inputs, logger = () => {}) {
	/*** PASSED ***/
	if (!inputs || !inputs.length)
		return 0;
	if (inputs.length === 1)
		return 1;

	const paths = getAllPathsTo(inputs, inputs.length - 1, 0);
	const result = paths.reduce((p,n) => p === null ? n.length : Math.min(p,n.length), null);
	logger(inputs);
	logger(result);
	return result === null ? 0 : result;


	function getAllPathsTo(array, end, iterations) {
		if (iterations > 1024)
			throw 'Out of control!';
		if (end === 0)
			return [];

		let paths = [];
		for (let element of getAllThatCanReach(array, end)) {
			if (element === 0) {
				paths.push([0]);
			} else {
				const subpaths = getAllPathsTo(array, element, iterations + 1);
				for (let sb of subpaths.filter(p => p.length > 0).map(p => [...p, end]))
					paths.push(sb);
			}
		}
		return paths;
	}

	function* getAllThatCanReach(array, element) {
		for (let i = element - 1; i >= 0; i--) {
			const distance = element - i;
			if (array[i] >= distance)
				yield i;
		}
	}
}


// Compression I: RLE Compression
export async function compression1RLECompression(ns, inputs, logger = () => {}) {
	const stream = [...countRLE(inputs)];
	return [...encode(stream)].join('');

	function* encode(stream) {
		for (let r of stream) {
			let { letter, count } = r;
			while (count > 9) {
				yield `9${letter}`;
				count -= 9;
			}
			yield `${count}${letter}`;
		}
	}

	function* countRLE(input) {
		let letter = null;
		let count = 0;

		for (let c of input) {
			if (letter === null) {
				letter = c;
				count +=1;
			} else if (letter !== c) {
				yield { letter, count };
				letter = c;
				count = 1;
			} else {
				count += 1;
			}
		}
		yield { letter, count };
	}
}


// Compression II: LZ Decompression
export async function compression2LZDecompression(ns, inputs, logger = () => {}) {
	throw 'Compression II: LZ Decompression -- Not Implemented';
}


// Compression III: LZ Compression
export async function compression3LZCompression(ns, inputs, logger = () => {}) {
	throw 'Compression III: LZ Compression -- Not Implemented';
}


// Encryption I: Caesar Cipher
export async function encryption1CaesarCipher(ns, inputs, logger = () => {}) {
	/*** PASSED ***/
	const a = 'A'.charCodeAt(0);
	const z = 'Z'.charCodeAt(0);
	const plain = inputs[0].toUpperCase();
	const shft = parseInt(inputs[1]);
	const len = plain.length;

	let answer = new Array(len);
	for (let i = 0; i < len; i++) {
		if (plain.charAt(i) == ' ') {
			answer[i] = ' ';
			continue;
		}

		const c = plain.charCodeAt(i);
		const n = c - shft;
		const adj = n < a
			? z + (n - a + 1)
			: n;
		answer[i] = String.fromCharCode(adj);
	}

	return answer.join('');
}


// Encryption II: Vigenère Cipher
export async function encryption2VigenereCipher(ns, inputs, logger = () => {}) {
	const a = "A".charCodeAt(0);
	const z = "Z".charCodeAt(0);
	const [plain, keyword] = inputs;

	const pu = plain.toUpperCase();
	const ku = keyword.toUpperCase();

	const plainLen = plain.length;
	const keyLen = keyword.length;
	const encyphered = new Array(plainLen);
	for (let i = 0; i < plainLen; i++) {
		const j = i % keyLen;
		const ra = pu.charCodeAt(i);
		const rk = ku.charCodeAt(j);
		const next = ra + (rk - a);
		const adjusted = (next > z)
			? a + (next % (z + 1))
			: next;
		encyphered[i] = String.fromCharCode(adjusted);
	}

	return encyphered.join("");	
}

// Find Largest Prime Factor
export async function findLargestPrimeFactor(ns, inputs, logger = () => {}) {
	const number = inputs;
	if (isPrime(number))
		return number;

	const halfN = Math.floor(number / 2);
	// there can be no divisor greater than half the number.
	for (let i = halfN; i >= 2; i--) {
		// because descending, first prime divisor is largest.
		if (number % i == 0 && isPrime(i))
			return i;
	}

	throw 'Should never reach here if number itself wasn\'t prime.';

	function isPrime(x) {
		if (x <= 1)
			throw `Invalid imput to isPrime(${x}).`

		// there can be no divisor greater than half the number.
		// number obvi can't be prime if there is a divisor.
		for (let i = 2; i <= x / 2; i++) {
			if (x % i == 0)
				return false;
		}
		return true;
	}
}


// Generate IP Addresses
// 25525511135 -> ["255.255.11.135", "255.255.111.35"]
// 1938718066 -> ["193.87.180.66"]
export async function generateIPAddresses(ns, inputs, logger = () => {}) {
	/*** PASSED ***/
	const numDigits = inputs.length;
	if (numDigits < 4) // min IP = [0.0.0.0]
		return [];

	const p1 = [createPair(0,1), createPair(0,2), createPair(0,3)];
	const p2 = p1.map(pair => {
		const { s: s1, l: l1 } = pair;
		const s2 = s1 + l1;
		return [createPair(s2,1),createPair(s2,2),createPair(s2,3)];
	});
	const p3 = p2.map(pairset => pairset.map(pair => {
		const { s: s2, l: l2 } = pair;
		const s3 = s2 + l2;
		return [createPair(s3,1),createPair(s3,2),createPair(s3,3)];
	}));
	const p4 = p3.map(pairsets => pairsets.map(pairset => pairset.map(pair => {
		const { s: s3, l: l3 } = pair;
		const s4 = s3 + l3;
		return [createPair(s4,1),createPair(s4,2),createPair(s4,3)];
	})));

	return [...getOctetSets()].map(octetSet => octetSet.join('.'));


	function createPair(s, l) { return { s, l }; }

	function* getOctetSets() {
		for (let i1 in p1) {
			const { s:s1, l:l1 } = p1[i1];
			const e1 = s1 + l1;
			const p1octet = inputs.substring(s1, e1);
			//logger(`1) ${s1}, ${l1}, ${p1octet} ${isValidOctet(p1octet)}`);
			if (!isValidOctet(p1octet))
				continue;

			for (let i2 in p2[i1]) {
				const { s:s2, l:l2 } = p2[i1][i2];
				const e2 = s2 + l2;
				if (e2 > numDigits)
					continue;
				const p2octet = inputs.substring(s2, e2);
				//logger(`2) ${s2}, ${l2}, ${p2octet} ${isValidOctet(p2octet)}`);
				if (!isValidOctet(p2octet))
					continue;
					
				for (let i3 in p3[i1][i2]) {
					const { s:s3, l:l3 } = p3[i1][i2][i3];
					const e3 = s3 + l3;
					if (e3 > numDigits)
						continue;
					const p3octet = inputs.substring(s3, e3);
					//logger(`3) ${s3}, ${l3}, ${p3octet} ${isValidOctet(p3octet)}`);
					if (!isValidOctet(p3octet))
						continue;

					for (let i4 in p4[i1][i2][i3]) {
						const { s:s4, l:l4 } = p4[i1][i2][i3][i4];
						const e4 = s4 + l4;
						if (e4 !== numDigits) // either orphaning the final digits, or extending beyond length.
							continue;
						const p4octet = inputs.substring(s4, e4);
						//logger(`4) ${s4}, ${l4}, ${p4octet} ${isValidOctet(p4octet)}`);
						if (!isValidOctet(p4octet))
							continue;
						
						yield [p1octet, p2octet, p3octet, p4octet];
					}
				}
			}
		}
	}

	function isValidOctet(octet) {
		if (octet.length === 0)
			return false;
		if (octet.length === 1)
			return true;
		if (octet[0] === '0')
			return false;
		const parsed = parseInt(octet, 10);
		return parsed < 256;
	}
}


// HammingCodes: Encoded Binary to Integer
export async function hammingcodesEncodedBinarytoInteger(ns, inputs, logger = () => {}) {
	throw 'HammingCodes: Encoded Binary to Integer -- Not Implemented';
}


// HammingCodes: Integer to Encoded Binary
export async function hammingcodesIntegertoEncodedBinary(ns, inputs, logger = () => {}) {
	throw 'HammingCodes: Integer to Encoded Binary -- Not Implemented';
}


// Merge Overlapping Intervals
export async function mergeOverlappingIntervals(ns, inputs, logger = () => {}) {
	inputs.sort(sortFunc);
	return [...computeIntervals(inputs)];

	function sortFunc(a,b) {
		const diff = a[0] - b[0];
		return (diff === 0)
			? a[1] - b[1]
			: diff;
	}

	function* computeIntervals(inputs) {
		let min = null, max = null;

		if (inputs.length === 0)
			return;
		
		for (let interval of inputs) {
			const [s, e] = interval;
			if (min === null) {
				min = s;
				max = e;
			} else if (s <= max) {
				if (e > max)
					max = e;
			} else {
				yield [min, max];
				min = s;
				max = e;
			}
		}

		yield [min, max];
	}	
}


// Minimum Path Sum in a Triangle
export async function minimumPathSuminaTriangle(ns, inputs, logger = () => {}) {
	throw 'Minimum Path Sum in a Triangle -- Tried, yet Not Implemented';
	const RootPath = [];
	if (!inputs)
		return 0;

	logger(inputs);

	const rows = inputs.length;
	const cols = inputs.map(i => i.length);
	const pathCache = new ObjectSet(x => x.nodeIndex);

	return getSmallestSum(inputs, rows, cols, pathCache, logger);

	function getSmallestSum(graph, rows, cols, pathCache, logger) {
		const row = rows - 1;
		const col = rows[row] - 1;
		const pathsTo = getPathsTo(row, col, 0);
		logger(pathsTo);
		return pathsTo.reduce((p,n) => Math.min(p, n), 99999999);

		function getPathsTo(row, col, iterations) {
			const cacheKey = (row, col) => (row * rows) + col;
			const cached = pathCache.fromKey(cacheKey);
			if (cached)
			return cached.path;

			if (iterations > 1024)
			throw 'Loss of control!!';

			if (row == 0 && col == 0)
				return RootPath;

			const paths = [...getNeighbors(graph, row, col)]
				.map(n => {
					const [prevRow, nextCol, distance] = n;
					const paths = getPathsTo(prevRow, nextCol, iterations + 1);
					return (!paths || paths.length == 0)
						? distance
						: paths.map(p => distance + p.reduce((t,d) => t + d, 0));
				})
				.reduce((p,n) => [...p, ...n], []);
				pathCache.add({ cacheKey, paths });
				return paths;
		}
	}

	function* getNeighbors(graph, row, col, cols) {
		if (row > 0) {
			const u = row - 1;
			const r = col + 1;
			const l = col - 1;
			if (r < cols[row])
				yield [u, r, graph[u][r]];
			if (l >= 0)
				yield [u, l, graph[u][l]];
		}
	}
}


// Proper 2-Coloring of a Graph
export async function proper2ColoringofaGraph(ns, inputs, logger = () => {}) {
	throw 'Proper 2-Coloring of a Graph -- Not Implemented';
}

// Shortest Path in a Grid
export async function shortestPathinaGrid(ns, inputs, logger = () => {}) {
	if (!inputs)
		return '';

	const NoPath = ['',-1];
	const RootPath = ['',0];

	const rows = inputs.length;
	const cols = inputs[0].length;
	const graph = inputs.reduce((p,n) => [...p, ...n], []);
	const pathCache = new ObjectSet(x => x.nodeIndex);
	const [path, _] = getShortestPath(graph, rows, cols, pathCache, logger);

	return path;

	
	function getShortestPath(graph, rows, cols, pathCache, logger) {
		pathCache.add({nodeIndex: 0, path: RootPath});
		return getPathTo(graph.length - 1, [], 0);

		function getPathTo(nodeIndex, askers, iterations) {
			logger(`${nodeIndex}idx [${askers}], ${iterations}its`);
			if (nodeIndex < 0 || nodeIndex >= (rows * cols))
				throw 'Invalid node index encountered!';

			const cached = pathCache.fromKey(nodeIndex);
			if (cached)
				return cached.path;
		
			if (iterations > 1024)
				throw 'Loss of control!!';

			if (nodeIndex == 0)
				return RootPath;
				
			const neighbors = [...getNeighbors(graph, nodeIndex, rows, cols)].filter(n => !askers.includes(n[1]));
			if (!neighbors || !neighbors.length)
				return NoPath;
			
			const nextAskers = [...askers, nodeIndex];
			nextAskers.sort((a,b) => a-b);
			const paths = neighbors
					.map(n => {
						const [dirToMe, nextIndex] = n;
						const [path, distance] = getPathTo(nextIndex, nextAskers, iterations + 1);
							
						if (distance == -1)
							return NoPath;
						return [`${path}${dirToMe}`, distance + 1];
					})
					.filter(p => p[1] !== -1);
			if (!paths || !paths.length)
				return NoPath;
			paths.sort((a,b) => a[1] - b[1]);
			const path = paths[0];
			logger(`adding ${nodeIndex}, ${path}`);
			pathCache.add({ nodeIndex, path });
			return path;
		}
	}

	function* getNeighbors(graph, nodeIndex, rows, cols) {
		const mapIndex = (row, col) => row * cols + col;

		const nodeCol = nodeIndex % cols;
		const nodeRow = Math.trunc(nodeIndex / cols);

		const upIndex = nodeRow == 0 ? -1 : mapIndex(nodeRow - 1, nodeCol);
		if (upIndex > -1 && graph[upIndex] != 1)
			yield ['D', upIndex];

		const downIndex = nodeRow == rows - 1 ? -1 : mapIndex(nodeRow + 1, nodeCol);
		if (downIndex > -1 && graph[downIndex] != 1)
			yield ['U', downIndex];

		const leftIndex = nodeCol == 0 ? -1 : mapIndex(nodeRow, nodeCol - 1);
		if (leftIndex > -1 && graph[leftIndex] != 1)
			yield ['R', leftIndex];

		const rightIndex = nodeCol == cols - 1 ? -1 : mapIndex(nodeRow, nodeCol + 1);
		if (rightIndex > -1 && graph[rightIndex] != 1)
			yield ['L', rightIndex];
	}
}

// Spiralize Matrix
export async function spiralizeMatrix(ns, inputs, logger = () => {}) {
	throw 'Spiralize Matrix -- Not Implemented';
}

// Unique Paths in a Grid I
export async function uniquePathsinaGrid1(ns, inputs, logger = () => {}) {
	const [x,y] = inputs;
	if (x < 1)
		return 0;
	if (x === 1)
		return 1;
	if (x === 2)
		return y;

	const RootPath = [''];
	const pathCache = new ObjectSet(x => x.nodeIndex);

	return countUniquePaths(inputs, x, y, pathCache, logger);

	function countUniquePaths(graph, rows, cols, pathCache, logger) {
		const pathsTo = getPathsTo(rows-1, cols-1, 0);
		return pathsTo.length;

		function getPathsTo(row, col, iterations) {
			const cacheKey = (row, col) => row * cols + col;
			const cached = pathCache.fromKey(cacheKey);
			if (cached)
				return cached.path;
		
			if (iterations > 1024)
				throw 'Loss of control!!';

			if (row == 0 && col == 0)
				return RootPath;

			const paths = [...getNeighbors(graph, row, col)]
				.map(n => {
					const [dirToMe, nextRow, nextCol] = n;
					const paths = getPathsTo(nextRow, nextCol, iterations + 1);
					if (!paths || paths.length == 0)
						return [];
					return paths.map(p => `${p}${dirToMe}`);
				})
				.filter(p => p.length > 0)
				.reduce((p,n) => [...p, ...n], []);
			pathCache.add({ cacheKey, paths });
			return paths;
		}
	}

	function* getNeighbors(graph, row, col) {
		if (row > 0) {
			const u = row - 1;
			yield ['D', u, col];
		}

		if (col > 0) {
			const l = col - 1;
			yield ['R', row, l];
		}
	}

	throw `Unique Paths in a Grid I -- Not Implemented with x = ${x}`;
}


// Unique Paths in a Grid II
export async function uniquePathsinaGrid2(ns, inputs, logger = () => {}) {
	if (!inputs)
		return 0;

	const RootPath = [''];
	const rows = inputs.length;
	const cols = inputs[0].length;
	const pathCache = new ObjectSet(x => x.nodeIndex);

	return countUniquePaths(inputs, rows, cols, pathCache, logger);

	function countUniquePaths(graph, rows, cols, pathCache, logger) {
		const pathsTo = getPathsTo(rows-1, cols-1, 0);
		logger(pathsTo);
		return pathsTo.length;

		function getPathsTo(row, col, iterations) {
			const cacheKey = (row, col) => row * cols + col;
			const cached = pathCache.fromKey(cacheKey);
			if (cached)
				return cached.path;
		
			if (iterations > 1024)
				throw 'Loss of control!!';

			if (row == 0 && col == 0)
				return RootPath;

			const paths = [...getNeighbors(graph, row, col)]
				.map(n => {
					const [dirToMe, nextRow, nextCol] = n;
					const paths = getPathsTo(nextRow, nextCol, iterations + 1);
					if (!paths || paths.length == 0)
						return [];
					return paths.map(p => `${p}${dirToMe}`);
				})
				.filter(p => p.length > 0)
				.reduce((p,n) => [...p, ...n], []);
			pathCache.add({ cacheKey, paths });
			return paths;
		}
	}

	function* getNeighbors(graph, row, col) {
		if (row > 0) {
			const u = row - 1;
			if (graph[u][col] === 0)
				yield ['D', u, col];
		}

		if (col > 0) {
			const l = col - 1;
			if (graph[row][l] === 0)
				yield ['R', row, l];
		}
	}
}
