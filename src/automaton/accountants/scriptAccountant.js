export default class Accountant {
    calcIncome(ns) {
        const [active] = ns.getTotalScriptIncome();
        return active;
    }

    buy() { return false; }
    getCost() { return null; }
}
