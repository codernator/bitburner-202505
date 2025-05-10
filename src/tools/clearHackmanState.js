import StateTranager from '/automaton/lib/statetranager';

/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog();
  ns.ui.openTail();
  
  const stateTran = new StateTranager(ns);
  ns.print(stateTran);
  stateTran.clear(ns);
}