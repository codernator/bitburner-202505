import { validateParens } from '/contracts/lib/validator.js';

export function solve(ns, input, logger = () => {}) {
    logger(`attempting sanitize parens with ${input}`);
	if (validateParens(input)) return [input];

	for (let num = 1; num < input.length - 2; num++) {
		const solutions = new Set();
        for (let indices of getRemoveIndices(input, num)) {
            const next = removeIndices(input, indices);
			if (validateParens(next))
				solutions.add(next);
        }
		if (solutions.size > 0) return [...solutions];
	}

    return [];
	//throw 'Sanitize Parentheses in Expression -- Not Implemented';
}

function removeIndices(input, indices) {
    const next = [];

    for (let i = 0; i < input.length; i++) {
        if (indices.indexOf(i) > -1)
            continue;
        next.push(input[i]);
    }

    return next.join('');
}

function* getRemoveIndices(input, num) {
    if (num === 1) {
        for (let i = 0; i < input.length; i++) {
            yield [i];
        }
        return;
    }

    const work = [];
    work.push({ start: 0, indices: [] });
    while (work.length > 0) {
        const { start, indices } = work.pop();
        for (let i = start; i < input.length; i++) {
            const next = [...indices, i];
            if (next.length === num)
                yield next;
            else
                work.push({ start: i + 1, indices: next });
        }
    }
}

export function unitTests(ns) {
    testGetRemoveIndices(ns);
    testRemoveIndices(ns);
}


function testRemoveIndices(ns) {
    ns.tprint("Remove Indices");
    ns.tprint("--------------------------");
    theory([
        { inputs: { input: 'abcd', indices: [0] }, expected: 'bcd' },
        { inputs: { input: 'abcd', indices: [0,3] }, expected: 'bc' },
    ]);

    function theory(testcases) {
        for(let testcase of testcases) {
            const { inputs: { input, indices }, expected } = testcase;
            const actual = removeIndices(input, indices);
            ns.tprint({ input, indices, actual, expected });
        }
    }
}

function testGetRemoveIndices(ns) {
    ns.tprint("Get Remove Indices");
    ns.tprint("--------------------------");
    theory([
        { inputs: { input: '()', num: 1 }, expected: [[0], [1]] },
        { inputs: { input: '()', num: 2 }, expected: [[0,1]] },
        { inputs: { input: '())', num: 2 }, expected: [[0,1],[0,2],[1,2]] },
    ]);

    function theory(testcases) {
        for(let testcase of testcases) {
            const { inputs: { input, num }, expected } = testcase;
            const actual = [...getRemoveIndices(input, num)];
            ns.tprint({ input, num, actual, expected });
        }
    }
}