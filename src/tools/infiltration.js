import { stringSortFunc, valueSortFunc, createMultiSorter } from '/lib/sorting';

class SortByOptions {
    static get City() { return 'city'; };
    static get Name() { return 'name'; };
    static get Difficulty() { return 'difficulty'; };
}

const schema = [
    [ 's', SortByOptions.Difficulty ],
    [ 'd', false ],
];

/** @param {NS} ns */
export async function main(ns) {
    const {
        s: orderBy,
        d: orderDescending,
    } = ns.flags(schema);
	const locations = [...getLocations(ns)].sort(createSorter(orderBy, orderDescending));

	ns.ui.clearTerminal();
	ns.tprint(`City       Name                      Dclty         SoA Rep          Sell Cash`);
	ns.tprint('-'.padEnd(77, '-'));
	for (let location of locations) {
		const city = location.city.padEnd(10);
		const name = location.name.padEnd(25);
		const difficulty = (100 * (location.difficulty / 3)).toFixed(0).padStart(5);
		const soaRep = location.SoARep.toLocaleString().padStart(15);
		const sellCash = ns.formatNumber(location.sellCash).padStart(18);
		ns.tprint(`${city} ${name} ${difficulty} ${soaRep} ${sellCash}`);
	}
}

function createSorter(orderBy, orderDescending) {
    switch (orderBy) {
        case SortByOptions.City: return createMultiSorter(
            [
                stringSortFunc('city', orderDescending),
                valueSortFunc('SoARep', true),
                valueSortFunc('sellCash', true),
                stringSortFunc('name', false),
            ]
        );
        case SortByOptions.Name: return createMultiSorter(
            [
                stringSortFunc('name', orderDescending),
                valueSortFunc('SoARep', true),
                valueSortFunc('sellCash', true),
                stringSortFunc('city', false),
            ]
        );
        case SortByOptions.Difficulty: return createMultiSorter(
            [
                valueSortFunc('difficulty', orderDescending),
                stringSortFunc('city', false),
                valueSortFunc('SoARep', true),
                valueSortFunc('sellCash', true),
                stringSortFunc('name', false),
            ]
        )
        default: return () => 0;
    }
}


function* getLocations(ns) {
	const locations = ns.infiltration.getPossibleLocations();
	for (let { name, city } of locations) {
		const { difficulty, reward: { SoARep, sellCash } } = ns.infiltration.getInfiltration(name);
		yield { city, name, difficulty, SoARep, sellCash };
	}
}
