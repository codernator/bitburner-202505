import ObjectSet from '/lib/objectSet';

// Algorithmic Stock Trader I
export async function solve1(ns, inputs, logger = () => {}) {
	/* PASSED */
	let subset = inputs;
	let best = 0;
	while (subset.length > 0) {
		let subBest = 0;
		const buy = subset.shift();
		const subsub = [...subset];
		while (subsub.length > 0) {
			const sell = subsub.shift();
			const profit = sell - buy;
			subBest = Math.max(subBest, profit);
		}
		best = Math.max(best, subBest);
	}
	return best;
}

// Algorithmic Stock Trader II
export async function solve2(ns, inputs, logger = () => {}) {
    const prices = inputs;
    const maxTransactions = Number.MAX_SAFE_INTEGER;
    logger({ ast2: { maxTransactions, prices }});
    if (prices.length < 2) return 0;

    const profits = [];
    for (var i = prices.length - 2; i >= 0; i--) {
        const subprices = prices.slice(i);
        const nextProfits = [...getProfitsFrom(maxTransactions, subprices)];
        const best = nextProfits.reduce((p,n) => Math.max(p, n), 0);
        profits.push(best);
        await ns.sleep(0);
    }

    return profits.length === 0
        ? 0
        : profits.reduce((p,n) => Math.max(p,n), 0);
}

// Algorithmic Stock Trader III
export async function solve3(ns, inputs, logger = () => {}) {
	/* PASSED */
	const [p1, p2] = pass1(inputs);
	return p1 + p2;

	function pass1(subset) {
		let bests = [0,0];
		while (subset.length > 0) {
			let subBests = [0,0];
			const buy = subset.shift();
			const subsub = [...subset];
			while (subsub.length > 0) {
				let sell = subsub.shift();
				const profit = sell - buy;
				if (profit > subBests[0]) {
					const profit2 = pass2([...subsub]);
					subBests = calcBests(subBests, [profit, profit2]);
				}
			}
			bests = calcBests(bests, subBests);
		}
		return bests;
	}

	function calcBests(bests, profits) {
		const b = bests[0] + bests[1];
		const p = profits[0] + profits[1];
		return p > b ? profits : bests;
	}

	function pass2(subset) {
		let bestProfit = 0;
		while (subset.length > 0) {
			const buy = subset.shift();
			for (let sell of subset) {
				bestProfit = Math.max(sell - buy, bestProfit);
			}
		}
		return bestProfit;
	}	
}

// Algorithmic Stock Trader IV
export async function solve4(ns, inputs, logger = () => { }) {
    const [maxTransactions, prices] = inputs;
    logger({ ast4: { maxTransactions, prices }});
    if (maxTransactions <= 0 || prices.length < 2) return 0;

    const profits = [];
    for (var i = prices.length - 2; i >= 0; i--) {
        const subprices = prices.slice(i);
        const nextProfits = [...getProfitsFrom(maxTransactions, subprices)];
        const best = nextProfits.reduce((p,n) => Math.max(p, n), 0);
        profits.push(best);
        await ns.sleep(0);
    }

    return profits.length === 0
        ? 0
        : profits.reduce((p,n) => Math.max(p,n), 0);
}

function* getProfitsFrom(maxTransactions, originalPrices) {
    if (originalPrices.length < 2) return;

    const workpile = [];
    workpile.push(new WorkItem(null, 0, maxTransactions, originalPrices));
    while (workpile.length > 0) {
        const { holding, profit, txRemaining, prices } = workpile.pop();

        if (holding === null) { // time to buy
            // can't possibly create a transaction without 2 prices, so all done.
            if (prices.length < 2) {
                yield profit;
                continue;
            }

            const nextHolding = prices[0];
            for (let i = 1; i < prices.length; i++) {
                // queue up all remaining prices as possible sells.
                workpile.push(new WorkItem(
                    nextHolding,
                    profit,
                    txRemaining,
                    prices.slice(i)
                ));
            }
        } else { // time to sell (maybe)
            const nextPrice = prices[0];
            if (nextPrice <= holding) 
                continue;

            const nextTxRemaining = txRemaining - 1;
            const nextProfit = profit + (nextPrice - holding)
            yield nextProfit;
            if (nextTxRemaining === 0 || prices.length < 3) {
                // can't possibly create a buy/sell transaction from what's left, so all done.
                continue;
            }
            for (let i = 1; i < prices.length; i++) {
                workpile.push(new WorkItem(
                    null,
                    nextProfit,
                    nextTxRemaining,
                    prices.slice(i)
                ));
            }
        }
    }
}

class WorkItem {
    constructor(holding, profit, txRemaining, prices) {
        this.holding = holding;
        this.profit = profit;
        this.txRemaining = txRemaining;
        this.prices = prices;
    }
}

export function unitTests(ns) {

}
