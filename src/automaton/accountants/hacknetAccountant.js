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
    },
    [HacknetProduct.Server]: {
        getCost: (ns, _) => ns.hacknet.getPurchaseNodeCost(),
        buy: (ns, _) => ns.hacknet.purchaseNode(),
    }
};

export default class Accountant {
    static getCost(ns, product, index) {
        const func = productMethods[product].getCost;
        return func(ns, index);
    }

    static buy(ns, product, index) {
        const func = productMethods[product].buy;
        return func(ns, index);
    }
}
