export default class IncomeAccountant {
    /** @param {NS} ns */
    static async create(ns) {
        const earned = ns.getMoneySources();
        const fetchTime = new Date();
        await ns.sleep(2_000);
        return new IncomeAccountant(earned, fetchTime);
    }

    constructor(earned, fetchTime) {
        this.prime = earned.sinceStart;
        this.primeTime = fetchTime;
    }

    calcIncome(ns) {
        const earned = ns.getMoneySources().sinceStart;
        const fetchTime = new Date();
        const seconds = (fetchTime.getTime() - this.primeTime.getTime()) / 1_000;

        const deltas = [
            earned.crime - this.prime.crime,
            earned.hacking - this.prime.hacking,
            earned['hacknet'] - this.prime['hacknet'], // ram calculator wanted to treat this is the namespace
            earned.work - this.prime.work,
            earned.gang - this.prime.gang,
            //earned.stock - this.prime.stock,
            //earned.corporation - this.prime.corporation,
            //earned.bladeBurner - this.prime.bladeBurner,
        ];

        return deltas.reduce((p, n) => p + (n / seconds), 0);
    }

    calcExpenses(ns) {
        const spent = ns.getMoneySources().sinceStart;
        const fetchTime = new Date();
        const seconds = 1_000 * (fetchTime.getTime() - this.primeFetchTime());

        const deltas = [
            spent.class - this.prime.class,
            spent.gang_expenses - this.prime.gang_expenses,
            spent.hacknet_expenses - this.prime.hacknet_expenses,
            spent.servers - this.prime.servers,
        ];

        return deltas.reduce((p, n) => p + (n / seconds), 0);
    }
}
