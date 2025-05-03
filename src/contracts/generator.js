/** @param {NS} ns */
export async function main(ns) {
	const contracts = [...getContracts(ns)].sort((a,b) => a.functionname.localeCompare(b.functionname));
	const functions = [...getFunctions(contracts)];
	const indexEntries = [...getIndexEntries(contracts)];
	writeSolverFile(ns, functions, indexEntries);
	writeReadMes(ns, contracts);
}

function writeReadMes(ns, contracts) {
	for (let { ct, functionname } of contracts) {
		const filename = `/contracts/solvers/${functionname}.txt`;
		const rmer = `${functionname}.txt`;
		ns.write(filename, `${ct}\n`, 'w');
		ns.rm(rmer);
	}
}

function writeSolverFile(ns, functions, indexEntries) {
	const solverFile = '/contracts/solvers/maybe_index.js';
	ns.write(solverFile, '', 'w')
	ns.write(solverFile, buildIndex(indexEntries), 'a');
	ns.write(solverFile, functions.join('\n'), 'a');
}

function buildIndex(indexEntries) {
	return `
export const index = [
${indexEntries.map(e => `\t${e}`).join(',\n')}
];
`;
}

function* getIndexEntries(contracts) {
	for (let { ct, shortcut, functionname } of contracts) {
		yield `{ 'name': '${ct}', 'shortcut': '${shortcut}', 'method': ${functionname} }`;
	}
}

function* getFunctions(contracts) {
	for (let { ct, functionname } of contracts) {
		yield `
// ${ct}
export function ${functionname}(inputs, logger) {
	throw '${ct} -- Not Implemented';
}
`;
	}
}

function* getContracts(ns) {
	const contractTypes = ns.codingcontract.getContractTypes();
	for (let ct of contractTypes) {
		const parts = ct.replace(':', '').replace('-', '').replace('è', 'e').split(' ');
		const functionname = `${buildFileName(parts)}`;
		const shortcut = buildShortCut(parts);
		yield { ct, shortcut, functionname };
	}
}

function buildShortCut(parts) {
	return parts
		.filter(p => p!=='in' && p!=='of' && p!=='a' && p!=='to')
		.map(p => translateRomanNumeral(p)[0].toLowerCase())
		.join('');
}

function buildFileName(parts) {
	const fnameParts = parts.map((p,i) => {
		switch (i) {
			case 0: return p.toLowerCase();
			default: return translateRomanNumeral(p);
		}
	});
	return fnameParts.join('');
}

function translateRomanNumeral(part) {
	switch (part) {
		case 'V': return '5';
		case 'IV': return '4';
		case 'III': return '3';
		case 'II': return '2';
		case 'I': return '1';
		default: return part;
	}
}
