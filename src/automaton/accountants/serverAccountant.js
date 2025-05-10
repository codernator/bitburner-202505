import { ServerProduct } from '../lib/enums';

const productMethods = {
    [ServerProduct.AttackerServer]: {
        getCost: (ns, _, nextRam) => ns.getPurchasedServerCost(nextRam),
        buy: (ns, hostname, nextRam) => ns.purchaseServer(hostname, nextRam),
    },
    [ServerProduct.AttackerUpgrade]: {
        getCost: (ns, hostname, nextRam) => ns.getPurchasedServerUpgradeCost(hostname, nextRam),
        buy: (ns, hostname, nextRam) => ns.upgradePurchasedServer(hostname, nextRam),
    },
    [ServerProduct.SharerServer]: {
        getCost: (ns, _, nextRam) => ns.getPurchasedServerCost(nextRam),
        buy: (ns, hostname, nextRam) => ns.purchaseServer(hostname, nextRam),
    },
    [ServerProduct.SharerUpgrade]: {
        getCost: (ns, hostname, nextRam) => ns.getPurchasedServerUpgradeCost(hostname, nextRam),
        buy: (ns, hostname, nextRam) => ns.upgradePurchasedServer(hostname, nextRam),
    },
};

export default class Accountant {
    static getCost(ns, product, servername, nextram) {
        const func = productMethods[product].getCost;
        return func(ns, servername, nextram);
    }

    static buy(ns, product, servername, nextram) {
        const func = productMethods[product].buy;
        return func(ns, servername, nextram);
    }
}
