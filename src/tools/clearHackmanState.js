import StateMan from '/automaton/lib/stateman';

/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog();
  ns.ui.openTail();
  
  const stateMan = new StateMan(ns);
  ns.print(stateMan);
  stateMan.clear(ns);
}