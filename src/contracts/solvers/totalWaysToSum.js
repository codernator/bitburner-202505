// TODO - write in my own words
export async function solve1(ns, inputs, logger = () => { }) {
	//throw 'Total Ways to Sum -- No Solution Yet.'
	// The values of P(n) 
	// n    0  1  2  3  4  5  6   7   8   9   10  11  12  13   14
	// P(n) 1, 1, 2, 3, 5, 7, 11, 15, 22, 30, 42, 56, 77, 101, 135,
	// 5(n)    0, 1, 2, 5, 7, 12, 15, 22, 26, 35, 40, 51, 57, 70, 77, 92 ...
	// answer is P(n) - 1 (because P(n) includes n)
	const numPartitions = await countPartitions(inputs);
	return numPartitions - 1;

	async function countPartitions(n) {
		if (n < 2)
			return 0;

		if (n === 2)
			return 1;

		const p = Array(n); // An array to store a partition
		let iterations = 0;
		let k = 0; // Index of last element in a partition
		p[k] = n; // Initialize first partition as number itself
	
		// This loop first prints current partition then generates next
		// partition. The loop stops when the current partition has all 1s
		let numPartitions = 0;
		let j = 0;
		while (iterations < 100_000_000) {
			if (++j === 1000) {
				j = 0;
				await ns.sleep(0);
			}
			iterations++;

			// capture current partition
			numPartitions++;
	
			// Generate next partition
	
			// Find the rightmost non-one value in p[]. Also, update the
			// rem_val so that we know how much value can be accommodated
			let rem_val = 0;
			while (k >= 0 && p[k] == 1) {
				rem_val += p[k];
				k--;
			}
	
			// if k < 0, all the values are 1 so there are no more partitions
			if (k < 0)
				break;
	
			// Decrease the p[k] found above and adjust the rem_val
			p[k]--;
			rem_val++;

			// If rem_val is more, then the sorted order is violated. Divide
			// rem_val in different values of size p[k] and copy these values at
			// different positions after p[k]
			while (rem_val > p[k]) {
				p[k+1] = p[k];
				rem_val = rem_val - p[k];
				k++;
			}
	
			// Copy rem_val to next position and increment position
			p[k+1] = rem_val;
			k++;
		}

		return numPartitions;
	}	
}

export async function solve2(ns, inputs, logger = () => { }) {
    const [target, operands] = inputs;

    const expressions = new Set();
    for (let term of operands) {
        const workpile = [];
        workpile.push(new Solve2WorkItem(target, []));
        while (workpile.length > 0) {
            const { subtarget, potential } = workpile.pop();
            const nexttarget = subtarget - term;
            if (nexttarget === 0) {
                expressions.add([...potential, term].join('+'));
            } else if (nexttarget > 0) {
                workpile.push(new Solve2WorkItem(nexttarget, [...potential, term]));
            }
        }
        await ns.sleep(0);
    }

    return expressions.size;
}

class Solve2WorkItem {
    constructor(
        subtarget,
        potential,
    ) {
        this.subtarget = subtarget;
        this.potential = potential;
    }
}

export function unitTests(ns) {

}

