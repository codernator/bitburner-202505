/** @param {NS} ns */
export async function main(ns) {
  ns.ui.clearTerminal();
  ns.tprint(ns.infiltration.getPossibleLocations());
  //ns.tprint(ns.heart.break());
  //ns.openDevMenu();
  return;
  for (let f of Object.getOwnPropertyNames(ns.gang).sort(s => s))
    ns.tprint(f);
}
