import { HacknetProduct } from '../lib/enums';

const productMethods = {
    [HacknetProduct.Level]: {
        getCost: (ns, i) => ns.hacknet.getLevelUpgradeCost(i, 1),
        buy: (ns, i) => ns.hacknet.upgradeLevel(i),
    },
    [HacknetProduct.Ram]: {
        getCost: (ns, i) => ns.hacknet.getRamUpgradeCost(i, 1),
        buy: (ns, i) => ns.hacknet.upgradeRam(i, 1),
    },
    [HacknetProduct.Core]: {
        getCost: (ns, i) => ns.hacknet.getCoreUpgradeCost(i, 1),
        buy: (ns, i) => ns.hacknet.upgradeCore(i, 1),
    },
    [HacknetProduct.Cache]: {
        getCost: (ns, i) => ns.hacknet.getCacheUpgradeCost(i, 1),
        buy: (ns, i) => ns.hacknet.upgradeCache(i, 1),
    }
};

export default class Accountant {
    calcIncome(ns) {
      const { hacknet } = ns;
      return [...Array(hacknet.numNodes()).keys()].reduce((p,i) => p + hacknet.getNodeStats(i).production, 0);
    } 

    getCost(ns, args) {
        const [product, index] = args;
        const func = productMethods[product].getCost;
        return func(ns, index);
    }

    buy(ns, args) {
        const [product, index] = args;
        const func = productMethods[product].buy;
        return func(ns, index);
    }
}

