import config from '/automaton/.config';
import { calcBudget, calcIncomePerSecond, calcTimeToRaise } from '/automaton/accountant';

const { 
  shareTran: {
    nodeBuyer,
    upgradeBuyer,
    enableSharing,
    hostprefix,
    shareScript,
    maxNumSharers,
    minSharerRam,
    maxSharerRam,
    createName,
    parseIndex,
  },
} = config;

const schema = [
  ['logport', 0], // port on which to send log messages
];
/** @param {NS} ns */
export async function main(ns) {
  const {
    logport,
  } = ns.flags(schema);
  
  await requisitions(ns, logport);
  await upgrades(ns, logport);
  tryshare(ns, logport);
}


async function requisitions(ns, logport) {
  const sharehosts = ns.getPurchasedServers()
    .filter(s => s.startsWith(hostprefix))
    .map(s => ({ hostname: s, index: parseIndex(s) }));
  
  if (sharehosts.length >= maxNumSharers)
    return;
    
  const nextIndex = sharehosts.length === 0
    ? 1
    : sharehosts.sort(h => -h.index)[0].index + 1;
  const nextName = createName(nextIndex);
  const budget = calcBudget(ns, nodeBuyer);
  
  for (let ram = maxSharerRam; ram >= minSharerRam; ram = ram / 2) {
    const price = ns.getPurchasedServerCost(ram);
    if (price > budget)  continue;
    const timeToRaise = calcTimeToRaise(price, calcIncomePerSecond(ns), nodeBuyer);
    if (timeToRaise === null) return;
    
    if (ns.purchaseServer(nextName, ram)) {
      ns.writePort(logport, `Purchased ${nextName} with ${ns.formatRam(ram)} for ${ns.formatNumber(price)}.`)
    } else {
      ns.writePort(logport, `Failed to purchased ${nextName} with ${ns.formatRam(ram)} for ${ns.formatNumber(price)}.`)
    }

    if (timeToRaise > 0)
      await ns.sleep(timeToRaise);
    break;
  }
}

async function upgrades(ns, logport) {
  const sharehosts = ns.getPurchasedServers()
    .filter(s => s.startsWith(hostprefix))
    .map(s => ({  maxRam: ns.getServerMaxRam(s), hostname: s, index: parseIndex(s) }))
    .filter(h => h.maxRam < maxSharerRam)
    .sort(h => -h.maxRam);
    
  if (sharehosts.length === 0)  return;
    
  const { hostname, maxRam } = sharehosts[0];
  const nextRam = maxRam * 2;
  const budget = calcBudget(ns, upgradeBuyer);
  const price = ns.getPurchasedServerUpgradeCost(hostname, nextRam);
  if (price > budget)  return;
  const timeToRaise = calcTimeToRaise(price, calcIncomePerSecond(ns), upgradeBuyer);
  if (timeToRaise === null) return;
    
  if (ns.upgradePurchasedServer(hostname, nextRam)) {
    ns.writePort(logport, `Upgraded ${hostname} from ${ns.formatRam(maxRam)} to ${ns.formatRam(nextRam)} for ${ns.formatNumber(price)}.`)
  } else {
    ns.writePort(logport, `Failed to upgrade ${hostname} from ${ns.formatRam(maxRam)} to ${ns.formatRam(nextRam)} for ${ns.formatNumber(price)}.`)
  }
  
  if (timeToRaise > 0)
    await ns.sleep(timeToRaise);
}

function tryshare(ns, logport) {
  if (!enableSharing) 
    return;
    
  const sharehosts = ns.getPurchasedServers()
    .filter(s => s.startsWith(hostprefix))
    .map(s => ({  maxRam: ns.getServerMaxRam(s), hostname: s, index: parseIndex(s) }));
    
  for (let { hostname, maxRam } of sharehosts) {
    if (!ns.scriptRunning(shareScript, hostname)) {
      const threads = maxRam / 4;
      ns.scp(shareScript, hostname);
      const sharepid = ns.exec(shareScript, hostname, { threads });
      //ns.writePort(logport, `Activating sharer on ${hostname} with ${ns.formatRam(maxRam)} using ${threads} threads -- PID = ${sharepid}.`);
    }
  }
}