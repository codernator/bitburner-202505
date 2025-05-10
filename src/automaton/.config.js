import { allPorts } from './lib/constants';
import { Buyer, AttackerProduct, HacknetProduct } from './lib/enums';

// frequently changing values
// -------------------------------------
const requiredSavings = 33_000_000; // how much the accountant wants to save before approving a purchase.
const requiredHostRam = 16; // minimum ram on servers in the attack network to allow for hosting attacks on them.
const requiredHomeRam = 64; // how much ram to ensure always is free on home.
const requiredHomeThreads = 8; // number of threads to use for attacks on home.
const maxNumAttackers = 4;
// -------------------------------------

const attackerHostPrefix = 'attacker';
const sharerHostPrefix = 'sharer';

const createServerName = (prefix, index) => `${prefix}-${index}`;
function parseServerIndex(s) {
    const dashel = s.lastIndexOf('-');
    if (dashel < 0 || dashel === s.length - 1) {
        const flubbed = parseInt(s.substring(s.length -1), 10);
        return isNaN(flubbed) ? 0 : flubbed;
    }
    const parsed = parseInt(s.substring(dashel + 1), 10);
    return isNaN(parsed) ? 0 : parsed;
}

function createAccounting() {
    const buyerDefaults = {
        enablePurchasing: true,
        raisePercent: 0.5,
        minTimeToRaise: 100,
        maxTimeToRaise: 5 * 60 * 1_000, // 5 minutes
        budgetCalculator: avail => avail,
    };

    return ({
        saveAmount: requiredSavings,
        enablePurchasing: true,

        buyers: {
            [Buyer.HacknetNodeBuyer]: {
                ...buyerDefaults,
                raisePercent: 0,
            },
            [Buyer.HacknetUpgradeBuyer]: {
                ...buyerDefaults,
            },
            [Buyer.WaresBuyer]: {
                ...buyerDefaults,
                enableBuyer: false,
            },
            [Buyer.SharerNodeBuyer]: {
                ...buyerDefaults,
                enableBuyer: true,
                raisePercent: 0.10,
                budgetCalculator: avail => avail * .50,
            },
            [Buyer.SharerUpgradeBuyer]: {
                ...buyerDefaults,
                raisePercent: 0.10,
                budgetCalculator: avail => avail * .50,
            },
            [Buyer.AttackerBuyer]: {
                ...buyerDefaults,
                budgetCalculator: avail => avail * .50,
            },
        },
    });
}

function createAccountant() {
    const accountantDefaults = {
        enableBuyer: true,
        saveAmount: requiredSavings,
        raisePercent: 0.5,
        minTimeToRaise: 100,
        maxTimeToRaise: 5 * 60 * 1_000, // 5 minutes
        budgetCalculator: avail => avail,
    };
    
    return ({
        buyers: {
            [Buyer.HacknetNodeBuyer]: {
                ...accountantDefaults,
                raisePercent: 0,
            },
            [Buyer.HacknetUpgradeBuyer]: {
                ...accountantDefaults,
            },
            [Buyer.WaresBuyer]: {
                ...accountantDefaults,
                enableBuyer: false,
                saveAmount: 0,
            },
            [Buyer.SharerNodeBuyer]: {
                ...accountantDefaults,
                enableBuyer: true,
                raisePercent: 0.10,
                budgetCalculator: avail => avail * .50,
            },
            [Buyer.SharerUpgradeBuyer]: {
                ...accountantDefaults,
                raisePercent: 0.10,
                budgetCalculator: avail => avail * .50,
            },
            [Buyer.AttackerBuyer]: {
                ...accountantDefaults,
                budgetCalculator: avail => avail * .50,
            },
        },
    });
}

function createAttackerBuyerTran() {
    return ({
        buyer: Buyer.AttackerBuyer,
        hostprefix: attackerHostPrefix,
        maxNumAttackers,
        minAttackerRam: 1024,
        maxAttackerRam: 1024 * (2 ** 6),
    
        createName: index => createServerName(attackerHostPrefix, index),
        parseIndex: parseServerIndex,
    });
};

function createHackerTran() {
    const weakCondition = target => target.hackDifficulty > target.minDifficulty + 3;
    const growCondition = target => target.moneyAvailable < target.moneyMax * 0.5;
    const hackCondition = target => target.moneyAvailable > target.moneyMax * 0.25;
    const getAttacks = target => [
        weakCondition(target) ? 'w' : null,
        growCondition(target) ? 'g' : null,
        hackCondition(target) ? 'h' : null,
    ].filter(a => a !== null);
    
    return ({
        attackScript: "/tools/hacker.js",
    
        weakCondition,
        growCondition,
        hackCondition,
        getAttacks,

        minHostRam: requiredHostRam ,
        saveHomeRam: requiredHomeRam,
        useHomeThreads: requiredHomeThreads,
        useHome: true,
        useRootedServers: true,
        useAttackerServers: true,
        attackerHostPrefix,
    });
}

function createHacknetTran() {
    const defaults = {
        enabled: true,
    };
    
    return ({
        HacknetProduct,
        maxNodes: 24,

        nodeBuyer: Buyer.HacknetNodeBuyer,
        upgradeBuyer: Buyer.HacknetUpgradeBuyer,
    
        products: [
            { 
                ...defaults,
                name: 'level', 
                productType: HacknetProduct.Level,
                max: 200, 
                getCurrent: stats => stats.level,
            },
            { 
                ...defaults,
                name: 'ram', 
                productType: HacknetProduct.Ram,
                max: 64,
                getCurrent: stats => stats.ram,
            },
            {
                ...defaults,
                name: 'core', 
                productType: HacknetProduct.Core,
                max: 16,
                getCurrent: stats => stats.cores,
            },
            {
                ...defaults,
                enabled: false,
                name: 'cache',
                productType: HacknetProduct.Cache,
                max: 12,
                getCurrent: stats => stats.cache, // stats.hashCapacity
            },
        ],
    });
}

function createShareTran() {
    return ({
        nodeBuyer: Buyer.SharerNodeBuyer,
        upgradeBuyer: Buyer.SharerUpgradeBuyer,
        enableSharing: true,
        hostprefix: sharerHostPrefix,
        shareScript: '/tools/sharer.js',
        maxNumSharers: 2,
        minSharerRam: 1024,
        maxSharerRam: 1024 * (2 ** 6),
    
        createName: index => createServerName(sharerHostPrefix, index),
        parseIndex: parseServerIndex,
    });
}

function createController() {
    const queuePort = allPorts.automaton.queuePort;
    const ackPort = allPorts.automaton.ackPort;
    const logPort = allPorts.automaton.logPort;

    return ({
        queuePort,
        ackPort,
        logPort,
        lockDuration: 10 * 60 * 1_000, // 10 minutes
        modules: [
            {
                script: '/automaton/tranagers/attackerbuyertran.js',
                enabled: true,
                createArgs: () => [ '--logport', logPort ],
            },
            {
                script: '/automaton/tranagers/hacknettran.js',
                enabled: true,
                createArgs: () => [ '--logport', logPort ],
            },
            {
                script: '/automaton/tranagers/hackertran.js',
                enabled: true,
                createArgs: stateCache => [ '-q', queuePort, '-a', ackPort, '--logport', logPort, '--state', stateCache.serialize() ],
            },
            {
                script: '/automaton/tranagers/sharetran.js',
                enabled: true,
                createArgs: () => [ '--logport', logPort ],
            },
        ],
    });
}

export default {
    Buyer,
    
    accountant: createAccountant(),
    accounting: createAccounting(),
    
    attackerBuyerTran: createAttackerBuyerTran(),
    hackerTran: createHackerTran(),
    hacknetTran: createHacknetTran(),
    shareTran: createShareTran(),
    
    controller: createController(),
};
