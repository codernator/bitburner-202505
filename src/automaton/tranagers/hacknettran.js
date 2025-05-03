import { calcBudget, calcIncomePerSecond, calcTimeToRaise } from '/automaton/accountant';
import config from '/automaton/.config';

const {
  hacknetTran: {
    HacknetProduct,
    nodeBuyer,
    upgradeBuyer,
    maxNodes,
    products,
  }
} = config;

const productMethods = {
  [HacknetProduct.Level]: {
    getCost: (ns, i) => ns.hacknet.getLevelUpgradeCost(i, 1),
    buy: (ns, i) => ns.hacknet.upgradeLevel(i),
  },
  [HacknetProduct.Ram]: {
    getCost: (ns, i) => ns.hacknet.getRamUpgradeCost(i, 1),
    buy: (ns, i) => ns.hacknet.upgradeRam(i, 1),
  },
  [HacknetProduct.Core]: {
    getCost: (ns, i) => ns.hacknet.getCoreUpgradeCost(i, 1),
    buy: (ns, i) => ns.hacknet.upgradeCore(i, 1),
  },
  [HacknetProduct.Cache]: {
    getCost: (ns, i) => ns.hacknet.getCacheUpgradeCost(i, 1),
    buy: (ns, i) => ns.hacknet.upgradeCache(i, 1),
  }
};

const schema = [
  ['logport', 0], // port on which to send log messages
];

export async function main(ns) {
  const { logport } = ns.flags(schema);
  const logger = (ns, msg) => ns.writePort(logport, msg);

  await requisitionServer(ns, logger);
  await requisitionUpgrade(ns, logger);
}

async function requisitionServer(ns, logger) {
  const numNodes = ns.hacknet.numNodes();
  if (numNodes >= maxNodes)
    return;

  const budget = calcBudget(ns, nodeBuyer);
  if (budget === 0)
    return;


  const cost = ns.hacknet.getPurchaseNodeCost();
  if (cost > budget)
    return;

  const income = calcIncomePerSecond(ns);
  const timeToRaise = calcTimeToRaise(cost, income, nodeBuyer);
  if (timeToRaise === null)
    return;
    
  if (!ns.hacknet.purchaseNode())
    return;

  logger(ns, `Hacknet bought node ${(numNodes + 1)} for ${ns.formatNumber(cost,2)}.`);  
  if (timeToRaise > 0) {
    logger(ns, `HACKNET NodeBuyer LOCK: ${new Date()} ${timeToRaise}\r\n`);
    await ns.sleep(timeToRaise);
  }
}

async function requisitionUpgrade(ns, logger) {
  const masterNodeList = createMasterNodeList(ns, products);
  const totalNodeData = calcNodeTotals(masterNodeList);
  if (totalNodeData.fullUpgrades == maxNodes)
    return;

  const upgrades = masterNodeList
    .reduce((r, c) => r.concat(flattenNode(c)), [])
    .filter(p => p.current < p.max)
    .sort((a, b) => a.cost - b.cost);
  if (upgrades.length == 0)
    return;


  const budget = calcBudget(ns, upgradeBuyer);
  if (budget === 0)
    return;

  const income = calcIncomePerSecond(ns);
  const [{ name, node, cost, buy }] = upgrades;
  if (cost > budget)
    return;

  const timeToRaise = calcTimeToRaise(cost, income, upgradeBuyer);
  if (timeToRaise === null)
    return;

  if (!buy(ns, node))
    return;

  logger(ns, `Bought ${name} for node ${node} for ${ns.formatNumber(cost,2)}.`);
  if (timeToRaise > 0) {
    logger(ns, `HACKNET UpgradeBuyer LOCK: ${new Date()} ${timeToRaise}\r\n`);
    await ns.sleep(timeToRaise);
  }
}

function createMasterNodeList(ns, products) {
	const numNodes = ns.hacknet.numNodes();
	if (numNodes == 0)
		return [];

	return [...Array(numNodes).keys()].map(node => {
		const stats = ns.hacknet.getNodeStats(node);
		return ({
			node,
			stats,
			products: products.filter(product => product.enabled).map(product => {
        const methods = productMethods[product.productType];
        return ({
					...product,
          ...methods,
					cost: methods.getCost(ns, node),
					current: product.getCurrent(stats),
        });
      }),
		});
	});
}

function flattenNode(nodeData) {
	return nodeData.products
		.filter(p => p.current < p.max)
		.map(p => ({
			'node': nodeData.node,
			...p
		}));
}

function calcNodeTotals(nodeData) {
	return nodeData.reduce((p, c) => ({
		'production': p.production + c.stats.production,
		'fullUpgrades': p.fullUpgrades + (allUpgraded(c) ? 1 : 0),
	}), { 'production': 0, 'fullUpgrades': 0 });
}

function allUpgraded(nodeData) {
	return nodeData.products.reduce((p, c) => p && (c.current === c.max), true);
}
