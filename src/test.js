import solvers from 'contracts/solvers/index';

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.clearTerminal();

  for (let { name, shortcut, method, unittests } of solvers) {
    ns.tprint({ name, shortcut, method, unittests, missing: !method });  
  }
  //ns.tprint(ns.heart.break());
  //ns.openDevMenu();
  return;
  for (let f of Object.getOwnPropertyNames(ns.gang).sort(s => s))
    ns.tprint(f);
}
