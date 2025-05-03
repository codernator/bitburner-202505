const schema = [
  ['a', ''],     // attack mode: [g = grow, w = weaken, h = hack]
	['s', ''],     // name of server to attack
	['p', 0],      // port on which to acknowledge completion
	['c', 0],      // threads to use
];
/** @param {NS} ns */
export async function main(ns) {
	const {
    a: attackmode,
		p: ackport,
		c: threads,
    s: server,
	} = ns.flags(schema);

  ns.clearLog();

  if (['g','w','h'].indexOf(attackmode) < 0)
  {
    ns.print(`Invalid attack mode ${attackmode}!`);
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

  try {
    switch (attackmode)
    {
      case 'g': await ns.grow(server, { threads }); break;
      case 'h': await ns.hack(server, { threads }); break;
      case 'w': await ns.weaken(server, { threads }); break;
      default: throw `Unhandled attack mode ${attackmode}!`;
    }
    
    ns.writePort(ackport, `${server}:${attackmode}`);
  } catch (e) {
    ns.print(e);
    ns.ui.openTail();
    return;
  }
}