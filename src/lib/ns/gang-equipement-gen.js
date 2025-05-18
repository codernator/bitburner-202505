const efile = '/lib/ns/gang-equipment.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.ui.clearTerminal();
    const equipment = ns.gang.getEquipmentNames();
    ns.write(efile, JSON.stringify(equipment, null, 4));
}

