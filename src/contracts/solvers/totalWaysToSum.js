export async function solve1(ns, inputs, logger = () => { }) {
	const target = inputs;
	const operands = [...Array(target - 1).keys().map(k => k+1)];
	return await solve2(ns, [target, operands], logger);
}

export async function solve2(ns, inputs, logger = () => { }) {
    const [target, operands] = inputs;
    const expressions = new Set();
	const workpile = [];
	workpile.push(new Solve2WorkItem(target, operands, []));
	let iterations = 0;
	while (workpile.length > 0) {
		if (++iterations == 4096) {
			await ns.sleep(0);
			iterations = 0;
		}

		const { subtarget, suboperands, potential } = workpile.pop();
		if (suboperands.length === 0) continue;

		const [operand] = suboperands;
		const nextoperands = suboperands.slice(1);
		const dividend = Math.trunc(subtarget / operand);
		if (dividend === 0) {
			workpile.push(new Solve2WorkItem(subtarget, nextoperands, potential));
			continue;
		}

		for (let j = 0; j <= dividend; j++) {
			if (j === 0) {
				workpile.push(new Solve2WorkItem(subtarget, nextoperands, potential));
				continue;
			}
			const nexttarget = subtarget - operand * j;
			const nextpotential = [...potential, ...Array(j).keys().map(_ => operand)];
			if (nexttarget === 0) {
				expressions.add(nextpotential.join('+'));
			} else if (nexttarget > 0) {
				workpile.push(new Solve2WorkItem(nexttarget, nextoperands, nextpotential));
			}
		}
	}

    return expressions.size;
}

class Solve2WorkItem {
    constructor(
        subtarget,
		operands,
        potential,
    ) {
        this.subtarget = subtarget;
		this.suboperands = operands;
        this.potential = potential;
    }
}

export function unitTests(ns) {

}

