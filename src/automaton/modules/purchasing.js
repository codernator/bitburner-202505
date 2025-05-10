import config from '../.config';
import { ApprovalReason, Buyer } from '../lib/enums';
import RequisitionResponse from '../lib/requisitionResponse';
import StateCache from '../lib/stateCache';
/** +TEMPLATE Accountants */
import IncomeAccountant from '../accountants/incomeAccountant';
import HacknetAccountant from '../accountants/hacknetAccountant';
import ServerAccountant from '../accountants/serverAccountant';
/** -TEMPLATE Accountants */

/** +TEMPLATE BuyerAccountantMap */
const buyerAccountantMap = {
    [Buyer.HacknetBuyer]: {
        getCost: HacknetAccountant.getCost,
        buy: HacknetAccountant.buy,
    },
    [Buyer.ServerBuyer]: {
        getCost: ServerAccountant.getCost,
        buy: ServerAccountant.buy,
    },
};
/** -TEMPLATE BuyerAccountantMap */

const {
    purchasing: {
        ports: {
            logPort,
            requisitionsPort,
            approvalsPorts,
            accountantStatePort,
        },
        saveAmount,
        enablePurchasing,
        buyerDefaults,
        buyers,
    }
} = config;

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.ui.openTail();

    var buyerLocks = new StateCache(
        StateCache.createDefaultUnPersistFunc(ns, accountantStatePort),
        StateCache.createDefaultPersistFunc(ns, accountantStatePort)
    );
    const incomeAccountant = await IncomeAccountant.create(ns);
    while (true) {
        processLogs(ns);

        const requisition = pollRequisitions(ns);
        if (requisition !== null) {
            const income = incomeAccountant.calcIncome(ns);
            const answer = processRequisition(ns, requisition, income, buyerLocks);
            sendResponse(ns, requisition, answer);
        }

        buyerLocks.invalidate();

        await ns.sleep(25);
    }
}

/** @param {NS} ns */
function processLogs(ns) {
    var target = ns.readPort(logPort);
    if (target !== 'NULL PORT DATA') {
        ns.print(target);
    }
}

/** @param {NS} ns */
function pollRequisitions(ns) {
    const portData = ns.readPort(requisitionsPort)
    if (portData === 'NULL PORT DATA') return null;
    return JSON.parse(portData);
}

/** @param {NS} ns */
function sendResponse(ns, requisition, response) {
    ns.writePort(approvalsPorts[requisition.buyer], JSON.stringify(response));
}

function getBuyerConfig(buyer, product) {
    const buyerConfig = buyers[buyer];
    if (!buyerConfig) return buyerDefaults;
    if (buyerConfig[product]) return buyerConfig[product];
    return buyerConfig;
}

/** @param {NS} ns */
function processRequisition(ns, requisition, income, buyerLocks) {
    const { buyer, product, args } = requisition;

    if (!enablePurchasing) 
        return RequisitionResponse.Denied(ApprovalReason.RequisitionsSuspended, requisition);

    if (buyerLocks.has(buyer)) 
        return RequisitionResponse.Denied(ApprovalReason.BuyerLocked, requisition);

    const buyerConfig = getBuyerConfig(buyer, product);
    if (!buyerConfig.enablePurchasing) 
        return RequisitionResponse.Denied(ApprovalReason.BuyerSuspended, requisition);

    const accountant = buyerAccountantMap[buyer];
    if (!accountant) 
        return RequisitionResponse.Denied(ApprovalReason.NoAccountant, requisition);

    const cost = accountant.getCost(ns, product, ...args);
    const budget = calcBudget(ns, buyerConfig)
    if (cost > budget) 
        return RequisitionResponse.Denied(ApprovalReason.InsufficientFunds, requisition, { cost, budget });

    const timeToRaise = calcTimeToRaise(cost, income, buyerConfig);
    if (timeToRaise === null)
        return RequisitionResponse.Denied(ApprovalReason.InsufficientIncome, requisition, { cost, budget, timeToRaise });

    if (!accountant.buy(ns, product, ...args))
        return RequisitionResponse.Denied(ApprovalReason.PurchaseFailed, requisition, { cost, budget });

    if (timeToRaise > 0)
        buyerLocks.track(buyer, timeToRaise);

    return RequisitionResponse.Approved(requisition, cost);
}

/** @param {NS} ns */
function calcBudget(ns, buyerConfig) {
    const { money } = ns.getPlayer();
    const { budgetCalculator } = buyerConfig;
    const avail = Math.max(money - saveAmount, 0);
    return budgetCalculator(avail);
};

function calcTimeToRaise(cost, income, buyerConfig) {
    if (buyerConfig.raisePercent === 0) return 0;
    if (income < 1) return null;

    const timeToRaise = (cost * buyerConfig.raisePercent) / income;

    if (!isFinite(timeToRaise) || timeToRaise > buyerConfig.maxTimeToRaise)
        return null;

    return timeToRaise > buyerConfig.minTimeToRaise ? timeToRaise : 0;
};
