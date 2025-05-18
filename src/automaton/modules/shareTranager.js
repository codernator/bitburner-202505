import config from '/automaton/.config';
const { 
    shareTranager: {
        enableSharing,
        hostprefix,
        shareScript,
    },
} = config;

const schema = [
    ['logport', 0], // port on which to send log messages
    ['v', false],
];
/** @param {NS} ns */
export async function main(ns) {
    const {
        logport,
        v: verbose,
    } = ns.flags(schema);
    const logger = verbose
        ? msg => ns.writePort(logport, msg)
        : () => {}; 
    tryshare(ns, logger);
}

function tryshare(ns, logger) {
    if (!enableSharing) 
        return;
        
    const hosts = ns.getPurchasedServers()
        .filter(s => s.startsWith(hostprefix))
        .map(servername => ns.getServer(servername));
        
    for (let { hostname, maxRam } of hosts) {
        if (!ns.scriptRunning(shareScript, hostname)) {
            const threads = maxRam / 4;
            ns.scp(shareScript, hostname);
            const sharepid = ns.exec(shareScript, hostname, { threads });
            logger(`Activating sharer on ${hostname} with ${ns.formatRam(maxRam)} using ${threads} threads -- PID = ${sharepid}.`);
        }
    }
}
