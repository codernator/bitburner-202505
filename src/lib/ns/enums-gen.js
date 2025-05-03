const efile = '/lib/ns/enums.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.ui.clearTerminal();
    ns.write(efile, JSON.stringify(ns.enums, null, 4));
}
