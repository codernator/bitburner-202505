import solverFactory from '/contracts/solverFactory.js';
import { mapShortHand } from 'contracts/solverFactory.js';

/** @param {NS} ns */
export async function main(ns) {
	const { 
    y: contractTypeCode,
    i: iterations,
    c: contract,
    a: tryit,
    v: verbose,
  } = ns.flags([
		['y', ''],
		['i', 10],
		['c', ''],
		['a', false],
    ['v', false]
	]);	

	if (contract) {
		await testByExisting(ns, contract, tryit, verbose);
	} else if (contractTypeCode) {
		await testByType(ns, contractTypeCode, iterations, verbose);
	} else {
		ns.tprint('test.js -ct <contractTypeCode> [-its <iterations>]');
		ns.tprint('test.js -c <contractFileOnHome>');
		return -1;
	}
}

async function testByExisting(ns, dummy, tryit, verbose) {
	if (!ns.fileExists(dummy)) {
		ns.tprint(`no file? ${dummy}`);
		return;
	}

	const contractType = ns.codingcontract.getContractType(dummy, 'home')
	const solver = solverFactory(contractType);
	if (!solver) {
		ns.tprint(`no solver for contract type ${contractType}`);
		return;
	}
	const inputs = ns.codingcontract.getData(dummy, 'home');
	const answer = await solver(ns, inputs, msg => ns.tprint(msg));
	if (!tryit) {
		ns.tprint({ title: 'Would have tried', answer });
		return;
	}
	const remaining = ns.codingcontract.getNumTriesRemaining(dummy, 'home');
	const reward = ns.codingcontract.attempt(answer, dummy, 'home');
	if (!reward || verbose) {
		ns.tprint(`${(reward ? 'Success': 'Fail')} on ${dummy} (${(remaining - 1)}).`);
  }
}

async function testByType(ns, contractTypeCode, iterations, verbose) {
	const contractType = mapShortHand(contractTypeCode);
	const solver = solverFactory(contractType);
	if (!solver) {
		ns.tprint(`no solver for contract type ${contractType}`);
		return;
	}

	for (let i = 0; i < iterations; i++)
		ns.codingcontract.createDummyContract(contractType);

	const dummies = ns.ls('home', '.cct');
	let fails = 0;
	for (let dummy of dummies) {
		const dummyType = ns.codingcontract.getContractType(dummy, 'home');
		if (dummyType !== contractType)
			continue;

		const inputs = ns.codingcontract.getData(dummy, 'home');
		const answer = await solver(ns, inputs, msg => { ns.tprint(msg); });
		const remaining = ns.codingcontract.getNumTriesRemaining(dummy, 'home');
		const reward = ns.codingcontract.attempt(answer, dummy, 'home');
		if (!reward || verbose) {
			ns.tprint(`${(reward ? 'Success': 'Fail')} on ${dummy} (${(remaining - 1)}).`);
      if (!reward) fails++;
		}
	}

	ns.tprint(`Pass: ${(iterations - fails)} of ${iterations}`);
}
