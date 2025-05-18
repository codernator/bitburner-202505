import solvers from 'contracts/solvers/index';

/** @param {NS} ns */
export async function main(ns) {
    ns.ui.clearTerminal();

    ns.tprintRaw(JSON.stringify([...getEquipment(ns)], null, 4));

    //ns.tprint(ns.heart.break());
    //ns.openDevMenu();
    return;
    for (let f of Object.getOwnPropertyNames(ns.gang).sort(s => s))
        ns.tprint(f);
}

function* getEquipment(ns) {
    const names = ns.gang.getEquipmentNames();
    for (let name of names) {
        const stats = ns.gang.getEquipmentStats(name);
        const cost = ns.gang.getEquipmentCost(name);
        const type = ns.gang.getEquipmentType(name);
        yield { 
            ...stats,
            name,
            cost,
            type,
        };
    }
}
