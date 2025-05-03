import { calcBudget, calcIncomePerSecond, calcTimeToRaise } from '/automaton/accountant';
import { Buyer } from '/automaton/.config/accountant.config';

const schema = [
  ['logport', 0],      // port on which to send log messages
];

/** @param {NS} ns */
export async function main(ns) {
  const { logport } = ns.flags(schema);

  if (!ns.hasTorRouter()) {
    const cost = 200_000;
    const budget = calcBudget(ns, Buyer.WaresBuyer);
    if (budget >= cost) {
      const income = calcIncomePerSecond(ns);
      const timeToRaise = calcTimeToRaise(cost, income, Buyer.WaresBuyer);
      if (ns.singularity.purchaseTor()) {
          ns.writePort(logport, "Purchased TOR Router");
          if (timeToRaise > 0)
            await ns.sleep(timeToRaise);
      }
    }
  }
}
