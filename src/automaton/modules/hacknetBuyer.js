import { pollWithTimout } from '../lib/polling';
import config from '/automaton/.config';
import HacknetAccountant from '../accountants/hacknetAccountant';
import { ApprovalType, Buyer, HacknetProduct } from '../lib/enums';
import RequesitionRequest from '../lib/requisitionRequest';

const {
    hacknetBuyer: {
        maxNodes,
        products,
    }
} = config;

const schema = [
    ['logport', 0], // port on which to send log messages
    ['reqport', 0], // port on which to send requisition
    ['ackport', 0], // prot on which to listen for requisition responses
];

/** @param {NS} ns */
export async function main(ns) {
    const {
        ackport,
        logport,
        reqport,
    } = ns.flags(schema);
    const logger = msg => ns.writePort(logport, msg);
    const requestor = request => ns.writePort(reqport, JSON.stringify(request));
    const respondee = () => ns.readPort(ackport);

    if (requestBuyServer(ns, requestor))
        await handleResponse(ns, respondee, logger)
    if (requestUpgrade(ns, requestor))
        await handleResponse(ns, respondee, logger)
}

/** @param {NS} ns */
async function handleResponse(ns, respondee, logger) {
    const response = await pollWithTimout(ns, respondee);
    if (response === null) return;

    const { approvalType, requisition: { buyer, product, args }, cost, wait} = JSON.parse(response);
    if (buyer !== Buyer.HacknetBuyer) throw new Error(`Unknown buyer ${buyer} in response!`);
    if (HacknetProduct.Parse(product) !== product) throw new Error(`Unknown product ${product} in response!`);

    if (approvalType === ApprovalType.Approved) {
        logger(`Requisitioned ${product} with args ${args.join(',')} for ${ns.formatNumber(cost)}.`);
    } else {
        logger(`Received response ${response}`);
        await ns.sleep(wait);
    }
}

/** @param {NS} ns */
function requestBuyServer(ns, requestor) {
    const numNodes = ns.hacknet.numNodes();
    if (numNodes >= maxNodes) return false;

    requestor(new RequesitionRequest(
        Buyer.HacknetBuyer,
        HacknetProduct.Server,
        []
    ));
    return true;
}

/** @param {NS} ns */
function requestUpgrade(ns, requestor) {
    const masterNodeList = createMasterNodeList(ns, products);
    const totalNodeData = calcNodeTotals(masterNodeList);
    if (totalNodeData.fullUpgrades == maxNodes) return false;

    const upgrades = masterNodeList
        .reduce((r, c) => r.concat(flattenNode(c)), [])
        .filter(p => p.current < p.max)
        .sort((a, b) => a.cost - b.cost);
    if (upgrades.length == 0) return false;

    const [{ node, productType }] = upgrades;

    requestor(new RequesitionRequest(
        Buyer.HacknetBuyer,
        productType,
        [node]
    ));
    return true;
}

/** @param {NS} ns */
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
                return ({
                    ...product,
                    cost: HacknetAccountant.getCost(ns, product.productType, node),
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
            node: nodeData.node,
            ...p
        }));
}

function calcNodeTotals(nodeData) {
    return nodeData.reduce((p, c) => ({
        production: p.production + c.stats.production,
        fullUpgrades: p.fullUpgrades + (allUpgraded(c) ? 1 : 0),
    }), { production: 0, fullUpgrades: 0 });
}

function allUpgraded(nodeData) {
    return nodeData.products.reduce((p, c) => p && (c.current === c.max), true);
}
