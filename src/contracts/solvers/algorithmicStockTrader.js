import ObjectSet from '/lib/objectSet.js';

export default function solveStockTrader(k, prices, logger) {
	const cache = new ObjectSet(i => i.key);
	const txPairs = [...getTxPairs(prices)];
	const best = getBestProfit(txPairs, cache, 0, 0);
	//logger(`${prices} = ${best}`);
	return best;

	function getBestProfit(txPairs, cache, numTx, iterations) {
		if (iterations > 52)
			throw 'Out of Control!';

		if (!isNaN(k) && numTx > k)
			return 0;

		let best = 0;
		for (let tx of txPairs) {
			const cacheKey = getCacheKey(prices, tx);
			const cached = cache.fromKey(cacheKey);
			if (cached !== null) {
				const { profit } = cached;
				best = Math.max(best, profit);
				//logger(`TXP: ${txPairs}  TX: ${tx}  CACHED: ${profit}`);
				continue;
			}
			const [b,s] = tx;
			const nextPairs = txPairs.filter(p => p[0] > s);
			const profit = Math.max(0, prices[s] - prices[b]);
			const newNumTx = profit === 0 
				? numTx 
				: numTx + 1;
			const tailProfit = nextPairs.length == 0 
				? 0 
				: getBestProfit(nextPairs, cache, newNumTx, iterations + 1);
			const bestProfit = profit + tailProfit;
			//logger(`TXP: ${txPairs}  TX: ${tx}  BP: ${bestProfit}`);
			cache.add({ 'key': cacheKey, 'profit': bestProfit });
			best = Math.max(best, bestProfit);
		}
		return best;
	}		
}


function getCacheKey(prices, tx) {
	const [b,s] = tx;
	return b * prices.length + s;
}

function* getTxPairs(prices) {
	for (let i = 0; i < prices.length; i++)
		for (let j = i + 1; j < prices.length; j++)
			yield [i, j];
}
