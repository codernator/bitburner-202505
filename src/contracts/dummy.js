import { mapShortHand } from 'contracts/solverFactory.js';

/** @param {NS} ns */
export async function main(ns) {
    const { y: contractTypeCode } = ns.flags([
      ['y', ''],
    ]);	  

  	const contractType = mapShortHand(contractTypeCode);
		ns.codingcontract.createDummyContract(contractType);
}