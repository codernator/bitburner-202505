import favme, { unitTests } from '/contracts/solvers/favme.js';
/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("Combinations of Terms");
  ns.tprint("-----------------------------");
  await unitTests.createCombinationsOfTerms(ns);
  ns.tprint("Expressions");
  ns.tprint("-----------------------------");
  await unitTests.createExpressions(ns);
  ns.tprint("Answer");
  ns.tprint("-----------------------------");
  await unitTests.answers(ns);
}