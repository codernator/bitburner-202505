import { Buyer, HacknetProduct } from './lib/enums';

// frequently changing values
// -------------------------------------
const requiredSavings = 33_000_000; // how much the Purchasing wants to save before approving a purchase.
const requiredHostRam = 64; // minimum ram on servers in the attack network to allow for hosting attacks on them.
const requiredHomeRam = 512; // how much ram to ensure always is free on home.
const requiredHomeThreads = 4096; // number of threads to use for attacks on home.
const maxNumAttackers = 4;
const useHome = true;
const useRootedServers = true;
const useAttackerServers = true;
// -------------------------------------

const allPorts = {
    automaton: {
        queuePort: 69,
        ackPort: 77,
        logPort: 420,
    },
    stateCache: {
        hackerStatePort: 142069,
        accountantStatePort: 142077,
    },
    purchasing: {
        logPort: 77420,
        requisitionsPort: 69420,
        approvalsPorts: {
            [Buyer.HacknetBuyer]: 42069,
            [Buyer.ServerBuyer]: 42077,
        }
    },
};

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

function createHacknetBuyer() {
    const defaults = {
        enabled: true,
    };
    
    return ({
        maxNodes: 24,
    
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

function createServerBuyer() {
    return ({
        buyer: Buyer.ServerBuyer,

        attacker: {
            hostprefix: attackerHostPrefix,
            maxNumServers: maxNumAttackers,
            minServerRam: 1024,
            maxServerRam: 1024 * (2 ** 6),
            createName: index => createServerName(attackerHostPrefix, index),
        },

        sharer: {
            hostprefix: sharerHostPrefix,
            maxNumServers: 2,
            minServerRam: 1024,
            maxServerRam: 1024 * (2 ** 6),
            createName: index => createServerName(sharerHostPrefix, index),
        },
    
        parseIndex: parseServerIndex,
    });
};

function createHackerTranager() {
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

        minHostRam: requiredHostRam,
        saveHomeRam: requiredHomeRam,
        useHomeThreads: requiredHomeThreads,
        useHome,
        useRootedServers,
        useAttackerServers,
        attackerHostPrefix,
    });
}

function createShareTranager() {
    return ({
        enableSharing: true,
        hostprefix: sharerHostPrefix,
        shareScript: '/tools/sharer.js',
        parseIndex: parseServerIndex,
    });
}

function createPurchasing() {
    const buyerDefaults = {
        enablePurchasing: true,
        raisePercent: 0.5,
        minTimeToRaise: 100,
        maxTimeToRaise: 5 * 60 * 1_000, // 5 minutes
        budgetCalculator: avail => avail,
    };
    const { 
        purchasing: purchasingPorts,
        stateCache: {
            accountantStatePort,
        }
     } = allPorts;

    return ({
        saveAmount: requiredSavings,
        enablePurchasing: true,
        buyerDefaults,
        ports: { ...purchasingPorts, accountantStatePort },

        buyers: {
            [Buyer.HacknetBuyer]: {
                ...buyerDefaults,
                overrides: {
                    [HacknetProduct.Server]: {
                        ...buyerDefaults,
                        raisePercent: 0,
                    },
                }
            },
            [Buyer.ServerBuyer]: {
                ...buyerDefaults,
                enableBuyer: true,
                raisePercent: 0.10,
                budgetCalculator: avail => avail * .50,
            },
        },
    });
}

function createController() {
    const {
        automaton: {
            queuePort,
            ackPort,
            logPort
        },
        purchasing: purchasingPorts,
        stateCache: {
            hackerStatePort,
        },
    } = allPorts;

    return ({
        lockDuration: 10 * 60 * 1_000, // 10 minutes
        ports: { ...allPorts.automaton, hackerStatePort, },
        modules: [
            {
                script: '/automaton/modules/purchasing.js',
                enabled: true,
                createArgs: () => [],
            },
            {
                script: '/automaton/modules/hacknetBuyer.js',
                enabled: true,
                createArgs: () => [
                    '--logport', purchasingPorts.logPort,
                    '--reqport', purchasingPorts.requisitionsPort ,
                    '--ackport', purchasingPorts.approvalsPorts[Buyer.HacknetBuyer],
                ],
            },
            {
                script: '/automaton/modules/serverBuyer.js',
                enabled: true,
                createArgs: () => [
                    '--logport', purchasingPorts.logPort,
                    '--reqport', purchasingPorts.requisitionsPort ,
                    '--ackport', purchasingPorts.approvalsPorts[Buyer.ServerBuyer],
                ],
            },
            {
                script: '/automaton/modules/hackerTranager.js',
                enabled: true,
                createArgs: stateCache => [ '-q', queuePort, '-a', ackPort, '--logport', logPort, '--state', stateCache.serialize() ],
            },
            {
                script: '/automaton/modules/shareTranager.js',
                enabled: true,
                createArgs: () => [ '--logport', logPort ],
            },
        ],
    });
}

export default {
    purchasing: createPurchasing(),
    controller: createController(),
    
    hacknetBuyer: createHacknetBuyer(),
    serverBuyer: createServerBuyer(),

    hackerTranager: createHackerTranager(),
    shareTranager: createShareTranager(),
};
