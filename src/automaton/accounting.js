import config from './.config';
import { allPorts, stringLists } from './lib/constants';
import { ApprovalType } from './lib/enums';
import { accountants, buyerAccountantMap } from './accountants';

const {
    accounting: {
        requisitionsPort,
        approvalsPort,
    }
} = allPorts;

const {
    requisitionDelimiter,
    requisitionArgsDelimiter,
} = stringLists;

const {
    accounting: {
        saveAmount,
        enablePurchasing,
        buyers,
    }
} = config;

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.ui.openTail();

    while (true) {
        const requisition = pollRequisitions(ns);
        if (requisition !== null) {
            const answer = processRequisition(requisition);
            sendApproval(...answer);
        }
        await ns.sleep(250);
    }
}

/** @param {NS} ns */
function pollRequisitions(ns) {
    const portData = ns.readPort(requisitionsPort)
    if (portData === 'NULL PORT DATA') return null;

    const [buyer, argsCSV = ''] = portData.split(requisitionDelimiter);
    const args = argsCSV.split(requisitionArgsDelimiter);
    return {
        buyer,
        args
    };
}

function processRequisition(requisition) {
    if (!enablePurchasing) return [ApprovalType.Suspended, 'Requisitions Suspended'];

    const { buyer, args } = requisition;
    const buyerConfig = buyers[buyer];
    if (!buyerConfig.enableBuyer) return [ApprovalType.Suspended, 'Buyer Suspended'];

    const accountant = buyerAccountantMap[buyer];
    if (!accountant) return [ApprovalType.Erroneous, 'No Accountant for Buyer'];

    const cost = accountant.getCost(args);
    const budget = calcBudget(ns, buyerConfig)
    if (cost < budget) return [ApprovalType.Denied, 'Insufficient Funds'];

    const income = calcIncome(ns);
    const timeToRaise = calcTimeToRaise(cost, income, buyerConfig);
    if (timeToRaise === null) return [ApprovalType.Denied, 'Insufficient Income'];
}

function sendApproval(approvalType, message) {
    ns.writePort(approvalsPort, JSON.stringify([approvalType, message]));
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

/** @param {NS} ns */
function calcIncome(ns) {
    return accountants.sum(a => a.calcIncome(ns));
};
