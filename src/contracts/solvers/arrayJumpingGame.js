// Array Jumping Game
export async function solve1(ns, inputs, logger = () => {}) {
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
export async function solve2(ns, inputs, logger = () => {}) {
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

export function unitTests(ns) {

}
