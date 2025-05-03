import config from '/automaton/.config';
import { calcBudget, calcIncomePerSecond, calcTimeToRaise } from '/automaton/accountant';

const { 
  attackerBuyerTran: {
    buyer,
    hostprefix,
    maxNumAttackers,
    minAttackerRam,
    maxAttackerRam,
    createName,
    parseIndex,
  }
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
}


async function requisitions(ns, logport) {
  const attackers = ns.getPurchasedServers()
    .filter(s => s.startsWith(hostprefix))
    .map(s => ({ hostname: s, index: parseIndex(s) }));
  
  if (attackers.length >= maxNumAttackers)
    return;
    
  const nextIndex = attackers.length === 0
    ? 1
    : attackers.sort(h => -h.index)[0].index + 1;
  const nextName = createName(nextIndex);
  const budget = calcBudget(ns, buyer);
  
  for (let ram = maxAttackerRam; ram >= minAttackerRam; ram = ram / 2) {
    const price = ns.getPurchasedServerCost(ram);
    if (price > budget) continue;
    
    const timeToRaise = calcTimeToRaise(price, calcIncomePerSecond(ns), buyer);
    if (timeToRaise === null) continue;
    
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
  const attackers = ns.getPurchasedServers()
    .filter(s => s.startsWith(hostprefix))
    .map(s => ({  maxRam: ns.getServerMaxRam(s), hostname: s, index: parseIndex(s) }))
    .filter(h => h.maxRam < maxAttackerRam)
    .sort(h => -h.maxRam);
    
  if (attackers.length === 0) 
    return;
    
  const { hostname, maxRam } = attackers[0];
  const nextRam = maxRam * 2;
  const budget = calcBudget(ns, buyer);
  const price = ns.getPurchasedServerUpgradeCost(hostname, nextRam);
  if (price > budget)  return;
  const timeToRaise = calcTimeToRaise(price, calcIncomePerSecond(ns), buyer);
  if (timeToRaise === null) return;
    
  if (ns.upgradePurchasedServer(hostname, nextRam)) {
    ns.writePort(logport, `Upgraded ${hostname} from ${ns.formatRam(maxRam)} to ${ns.formatRam(nextRam)} for ${ns.formatNumber(price)}.`)
  } else {
    ns.writePort(logport, `Failed to upgrade ${hostname} from ${ns.formatRam(maxRam)} to ${ns.formatRam(nextRam)} for ${ns.formatNumber(price)}.`)
  }

  if (timeToRaise > 0)
    await ns.sleep(timeToRaise);
}
