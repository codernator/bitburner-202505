
/** @param {NS} ns */
export async function main(ns) {
	const {
		o: operation,
		c: threads,
    s: serversCsv,
	} = ns.flags([
		['o', 'h'], // h=hack, w=weaken, g=grow 
		['c', 1], // cores, as it were
    ['s', "n00dles"],
	]);

	ns.clearLog();
	ns.atExit(() => ns.toast('Hackman Shutdown.'));
	ns.toast('Hackman Initialized.');
  ns.ui.openTail();

  ns.print(serversCsv);

  const operational = getOperational(ns, operation);
  const servers = serversCsv.split(",");
  while (true) {
    await operational(ns, threads, servers);
    await ns.sleep(100);
  }
}

function getOperational(ns, operation)
{
  switch (operation)
  {
    case "h": return doHacks;
    case "w": return doWeakens;
    case "g": return doGrows;
    default: ns.toast(`Unknown ${operation}`);
  }
}

async function doHacks(ns, threads, servers)
{
    for (var index in servers)
    {
      const server = servers[index];
      const chance = ns.hackAnalyzeChance(server);
      if (chance > 0)
        await ns.hack(server, { threads });

    }
}

async function doWeakens(ns, threads, servers)
{
    for (var index in servers)
    {
      const server = servers[index];
      const securityLevel = ns.getServerSecurityLevel(server);
      const minSecuritylevel = ns.getServerMinSecurityLevel(server);
      if (securityLevel > minSecuritylevel)      
        await ns.weaken(servers[index], { threads });
    }
}

async function doGrows(ns, threads, servers)
{
    for (var index in servers)
    {
      const server = servers[index];
      const moneyAvailable = ns.getServerMoneyAvailable(server);
      const maxMoney = ns.getServerMaxMoney(server);
      if (moneyAvailable < maxMoney)
        await ns.grow(server, { threads });
    }
}
