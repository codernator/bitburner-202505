const schema = [
    ['a', ''],     // attack mode: [g = grow, w = weaken, h = hack]
    ['s', ''],     // name of server to attack
    ['p', 0],      // port on which to acknowledge completion
    ['c', 0],      // threads to use
];
/** @param {NS} ns */
export async function main(ns) {
    const {
        a: attackMode,
        p: ackport,
        c: threads,
        s: server,
    } = ns.flags(schema);

    ns.clearLog();

    if (['g','w','h'].indexOf(attackMode) < 0)
    {
        ns.print(`Invalid attack mode ${attackMode}!`);
        ns.ui.openTail();
        return;
    }

    if (server == '')
    {
        ns.print("Invalid server!");
        ns.ui.openTail();
        return;
    }

    if (ackport <= 0)
    {
        ns.print("Invalid ack port!");
        ns.ui.openTail();
        return;
    }

    if (threads <= 0)
    {
        ns.print("Invalid number of threads!");
        ns.ui.openTail();
        return;
    }

    switch (attackMode)
    {
        case 'g': await ns.grow(server, { threads }); break;
        case 'h': await ns.hack(server, { threads }); break;
        case 'w': await ns.weaken(server, { threads }); break;
        default: throw `Unhandled attack mode ${attackMode}!`;
    }

    ns.writePort(ackport, JSON.stringify({ targetName: server, attackMode}));
}
