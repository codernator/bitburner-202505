import { SpiderScanMode, SpiderScanner } from '/lib/spiderutil.js';
import config from '../.config';
import StateCache from '../lib/stateCache';

const {
    hackerTran: {
        attackScript,

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

const schema = [
    ['q', 0],       // port on which to queue an attack
    ['a', 0],       // port on which to acknowledge completion
    ['logport', 0], // port on which to send log messages
    ['state', ''],  // servers already under attack
];

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

/** @param {NS} ns */
export async function main(ns) {
    const {
        q: queuePort,
        a: ackPort,
        logport,
        state
    } = ns.flags(schema);

    ns.disableLog("ALL");
    ns.print(`HACKMAN with q:${queuePort} a:${ackPort} s:${state}`);

    const hackingLevel = ns.getHackingLevel();
    const allservers = [...new SpiderScanner().scan(ns, SpiderScanMode.Hacked)];
    const hostable = new HostTracker([...getHosts(ns, allservers)]);

    const underAttack = StateCache.deserialize(state);
    const hackable = getHackable(allservers, hackingLevel)
        .filter(tpl => !underAttack.has({ hostname: tpl.server.hostname, attackMode: tpl.attackMode }));
      
    for (let { server, attackMode } of hackable) {
        const host = hostable.next();
        if (host === null)
            break;
        
        const { hostname, threads } = host;
        const { hostname: targetName } = server;

        ns.writePort(logport, createLogMessage(ns, server, host, attackMode, threads));
        ns.writePort(queuePort, JSON.stringify({ targetName, attackMode}));

        if (hostname !== 'home')
            ns.scp(attackScript, hostname);
        ns.exec(attackScript, hostname, { threads }, ...['-a', attackMode, '-s', targetName, '-p', ackPort, '-c', threads])
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
