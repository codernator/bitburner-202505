import { ShrarerProduct } from '../lib/enums';

const productMethods = {
    [ShrarerProduct.Server]: {
        getCost: (ns, _, nextRam) => ns.getPurchasedServerCost(nextRam),
        buy: (ns, hostname, nextRam) => ns.purchaseServer(hostname, nextRam),
    },
    [ShrarerProduct.Upgrade]: {
        getCost: (ns, hostname, nextRam) => ns.getPurchasedServerUpgradeCost(hostname, nextRam),
        buy: (ns, hostname, nextRam) => ns.upgradePurchasedServer(hostname, nextRam),
    },
};

export default class Accountant {
    calcIncome() { return 0; } 

    getCost(ns, args) {
        const [product, hostname, nextram] = args;
        const func = productMethods[product].getCost;
        return func(ns, hostname, nextram);
    }

    buy(ns, args) {
        const [product, hostname, nextram] = args;
        const func = productMethods[product].buy;
        return func(ns, hostname, nextram);
    }
};
