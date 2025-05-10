import config from '/automaton/.config';
//import Buyers from './buyers';
//import Accountants from './accountants';

const {
  accountant: {
    buyers,
  },
} = config;

///** @param {NS} ns */
//export async function main(ns) {
//  while (true) {
//
//  }
//}

/** @param {NS} ns */
export function calcBudget(ns, buyer) {
  const { money } = ns.getPlayer();
  const { enableBuyer, saveAmount, budgetCalculator = null } = buyers[buyer];
  if (!enableBuyer)
    return 0;
  const avail = Math.max(money - saveAmount, 0);
  return budgetCalculator === null
    ? avail
    : budgetCalculator(avail);
};

export function calcTimeToRaise(cost, income, buyer) {
  const buyerConfig = buyers[buyer];
  if (!buyerConfig.enableBuyer)
    return null;
  
  if (buyerConfig.raisePercent === 0) return 0;
  const timeToRaise = (cost * buyerConfig.raisePercent) / income;

  if (!isFinite(timeToRaise) || timeToRaise > buyerConfig.maxTimeToRaise)
    return null;
  return timeToRaise > buyerConfig.minTimeToRaise ? timeToRaise : 0;
};

/** @param {NS} ns */
export function calcIncomePerSecond(ns) {
  return hackNetIncome(ns) + scriptIncome(ns);
};

function hackNetIncome(ns) {
  const { hacknet } = ns;
  return [...Array(hacknet.numNodes()).keys()].reduce((p,i) => p + hacknet.getNodeStats(i).production, 0);
} 

function scriptIncome(ns) {
  const [active] = ns.getTotalScriptIncome();
  return active;
}
