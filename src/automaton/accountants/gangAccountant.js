import { GangProduct } from '../lib/enums';

const productMethods = {
    [GangProduct.Equipment]: {
        getCost: (ns, _, trapping) => ns.gang.getEquipmentCost(trapping),
        buy: (ns, member, trapping) => ns.gang.purchaseEquipment(member, trapping),
    },
    [GangProduct.Augment]: {
        getCost: (ns, _, trapping) => ns.gang.getEquipmentCost(trapping),
        buy: (ns, member, trapping) => ns.gang.purchaseEquipment(member, trapping),
    },
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

