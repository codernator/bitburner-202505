/** @param {NS} ns */
export async function main(ns) {
  ns.ui.clearTerminal();
  for (let f of Object.getOwnPropertyNames(ns).sort(s => s))
    ns.tprint(f);
}
