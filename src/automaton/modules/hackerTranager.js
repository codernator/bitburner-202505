import { SpiderScanMode, SpiderScanner } from '/lib/spiderutil.js';
import config from '../.config';
import StateCache from '../lib/stateCache';

const {
    allPorts: {
        automaton: {
            ackPort,
            logPort,
        },
        stateCache: {
            hackerStatePort,
        },
    },
    hackerTranager: {
        attackScript,
        lockDuration,

        getAttacks,

        minHostRam,
        saveHomeRam,
        useHomeThreads,
        useHome,
        useRootedServers,
        useAttackerServers,
        attackerHostPrefix,
    }
} = config;

const getThreads = host => host.maxRam / 2; // the attack script requires just under 2GB of RAM.

function* getHosts(ns, allservers) {
    if (useHome) {
        const { ramUsed, maxRam } = ns.getServer('home');
        const avail = Math.max(0, maxRam - ramUsed - saveHomeRam);
        const slices = Math.trunc(avail / (useHomeThreads * 2));
        
        if (slices > 0) {
            for (let i = 0; i < slices; i++)
                yield { hostname: 'home', threads: useHomeThreads, maxRam: avail };
        }
    }
    
    if (useAttackerServers) {
        const attackers = ns.getPurchasedServers()
            .filter(name => name.startsWith(attackerHostPrefix))
            .map(name => ns.getServer(name))
            .filter(server => server.ramUsed === 0)
            .map(server => ({ ...server, threads: getThreads(server) }));
        for (let attacker of attackers)
            yield attacker;
    }

    if (useRootedServers) {
        const rooted = allservers.filter(s => s.hasAdminRights && s.ramUsed == 0 && s.maxRam >= minHostRam)
            .sort(s => -s.maxRam)
            .map(s => ({ ...s, threads: getThreads(s) }));
        for (let server of rooted)
            yield server;
    }
}

function getHackable(allservers, hackingLevel) {
    return allservers
        .filter(s => s.moneyMax > 0 && hackingLevel >= s.requiredHackingSkill)
        .sort(s => -s.moneyAvailable)
        .reduce(
            (prev, server) => {
                const attacks = getAttacks(server);
                return attacks.length === 0
                  ? prev
                  : [...prev, ...attacks.map(attackMode => ({ server, attackMode }))];
            },
            []
        );
}

class HostTracker {
    constructor(hosts) {
        this.hosts = hosts;
        this.index = 0;
        this.lastIndex = hosts.length - 1;
    }

    next() {
        if (this.index > this.lastIndex) return null;
        const n = this.hosts[this.index];
        this.index++;
        return n;
    }
}

const createAttackKey = (targetName, attackMode) => ({ targetName, attackMode });

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog("ALL");
    const logger = msg => ns.writePort(logPort, msg);
    // logger(`HackerTranager with q:${queuePort} a:${ackPort}`);

    const stateCache = new StateCache(
        StateCache.createDefaultUnPersistFunc(ns, hackerStatePort),
        StateCache.createDefaultPersistFunc(ns, hackerStatePort),
        ns
    );
    processAcks(ns, stateCache, logger);
    attack(ns, stateCache, logger);
    stateCache.invalidate();

    stateCache.save();
}

function attack(ns, stateCache, logger) {
    const hackingLevel = ns.getHackingLevel();
    const allservers = [...new SpiderScanner().scan(ns, SpiderScanMode.Hacked)];
    const hostable = new HostTracker([...getHosts(ns, allservers)]);
    const hackable = getHackable(allservers, hackingLevel)
        .filter(tpl => !stateCache.has(createAttackKey(tpl.server.hostname, tpl.attackMode)));

    for (let { server, attackMode } of hackable) {
        const host = hostable.next();
        if (host === null)
            break;
        
        const { hostname, threads } = host;
        const { hostname: targetName } = server;

        logger(createLogMessage(ns, server, host, attackMode, threads));
        stateCache.track(createAttackKey(targetName, attackMode), lockDuration);

        if (hostname !== 'home')
            ns.scp(attackScript, hostname);
        ns.exec(attackScript, hostname, { threads }, ...['-a', attackMode, '-s', targetName, '-p', ackPort, '-c', threads])
    }
}

function processAcks(ns, stateCache, logger) {
    let target = ns.readPort(ackPort);
    while (target !== 'NULL PORT DATA') {
        const { targetName, attackMode } = JSON.parse(target);
        logger(`Releasing ${targetName} (${attackMode}).`);
        stateCache.untrack(createAttackKey(targetName, attackMode));

        target = ns.readPort(ackPort);
    }
}

function createLogMessage(ns, target, host, attackMode, threads) {
    const { hostname: tn, minDifficulty, hackDifficulty, moneyAvailable, moneyMax } = target;
    const { hostname: hn } = host;

    const md = ns.formatNumber(minDifficulty, 2);
    const hd = ns.formatNumber(hackDifficulty, 2);
    const ma = ns.formatNumber(moneyAvailable, 2);
    const mm = ns.formatNumber(moneyMax, 2);

    return `Attacking ${tn} on ${hn} with ${attackMode}[${threads}] (${md} ${hd} ${ma} ${mm})`;
}
