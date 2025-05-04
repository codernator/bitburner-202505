class Buyer {
	static get HacknetNodeBuyer() { return 'hacknetnodebuyer'; };
	static get HacknetUpgradeBuyer() { return 'hacknetupgradebuyer'; };
  static get WaresBuyer() { return 'waresbuyer'; };
  static get SharerNodeBuyer() { return 'sharernodebuyer'; };
  static get SharerUpgradeBuyer() { return 'sharerupgradebuyer'; };
  static get AttackerBuyer() { return 'attackerbuyer'; };
};

class HacknetProduct {
  static get Level() { return 'level'; };
  static get Ram() { return 'ram'; };
  static get Core() { return 'core'; };
  static get Cache() { return 'cache'; };
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

function createAccountant() {
  const accountantDefaults = {
    enableBuyer: true,
    saveAmount: 255_500_000, //1_000_200_000;
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
    maxNumAttackers: 2,
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
  
    minHostRam: 64,
    saveHomeRam: 64,
    useHomeThreads: 32,
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
  const queuePort = 69;
  const ackPort = 77;
  const logPort = 420;

  return ({
    queuePort,
    ackPort,
    logPort,
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
        createArgs: stateMan => [ '-q', queuePort, '-a', ackPort, '--logport', logPort, '--state', stateMan.serialize() ],
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
  
  attackerBuyerTran: createAttackerBuyerTran(),
  hackerTran: createHackerTran(),
  hacknetTran: createHacknetTran(),
  shareTran: createShareTran(),
  
  controller: createController(),
};
