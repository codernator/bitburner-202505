import config from '/automaton/.config';
import { ApprovalType, Buyer, ServerProduct } from '../lib/enums';
import RequesitionRequest from '../lib/requisitionRequest';
import { pollWithTimout } from '../lib/polling';

const { 
    serverBuyer: {
        attacker,
        sharer,
        parseIndex,
    },
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
  
    if (requestBuyServer(ns, requestor, ServerProduct.SharerServer, sharer))
        await handleResponse(ns, respondee, logger);
    if (requestUpgradeServer(ns, requestor, ServerProduct.SharerUpgrade, sharer))
        await handleResponse(ns, respondee, logger);
    if (requestBuyServer(ns, requestor, ServerProduct.AttackerServer, attacker))
        await handleResponse(ns, respondee, logger);
    if (requestUpgradeServer(ns, requestor, ServerProduct.AttackerUpgrade, attacker))
        await handleResponse(ns, respondee, logger);
}

/** @param {NS} ns */
async function handleResponse(ns, respondee, logger) {
    const response = await pollWithTimout(ns, respondee);
    if (response === null) return;

    const { approvalType, requisition: { buyer, product, args }, cost, wait} = JSON.parse(response);
    if (buyer !== Buyer.ServerBuyer) throw new Error(`Unknown buyer ${buyer} in response!`);
    if (ServerProduct.Parse(product) !== product) throw new Error(`Unknown product ${product} in response!`);

    if (approvalType === ApprovalType.Approved) {
        logger(`Requisitioned ${product} with args ${args.join(',')} for ${ns.formatNumber(cost)}.`);
    } else {
        logger(`Received response ${response}`);
        await ns.sleep(wait);
    }
}

/** @param {NS} ns */
function requestBuyServer(ns, requestor, product, subconfig) {
    const {
        hostprefix,
        maxNumServers,
        minServerRam,
        createName,
    } = subconfig
    
    const hosts = ns.getPurchasedServers()
        .filter(s => s.startsWith(hostprefix))
        .map(s => ({ hostname: s, index: parseIndex(s) }));

    if (hosts.length >= maxNumServers) return false;
    
    const nextIndex = hosts.length === 0
        ? 1
        : hosts.sort(h => -h.index)[0].index + 1;
    const nextName = createName(nextIndex);
    requestor(new RequesitionRequest(
        Buyer.ServerBuyer,
        product,
        [nextName, minServerRam] 
    ));
    return true;
}

/** @param {NS} ns */
function requestUpgradeServer(ns, requestor, product, subconfig) {
    const {
        hostprefix,
        maxServerRam,
    } = subconfig

    const hosts = ns.getPurchasedServers()
        .filter(s => s.startsWith(hostprefix))
        .map(servername => ({ ...ns.getServer(servername) }))
        .filter(server => server.maxRam < maxServerRam)
        .sort(server => server.maxRam);

    if (hosts.length === 0) return false;

    const { hostname, maxRam } = hosts[0];
    requestor(new RequesitionRequest(
        Buyer.ServerBuyer,
        product,
        [hostname, maxRam * 2] 
    ));
    return true;
}
