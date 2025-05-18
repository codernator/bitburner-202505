import config from '../.config';

const {
    allPorts: {
        automaton: {
            logPort: automatonLogPort,
        },
        purchasing: {
            logPort: purchasingLogPort,
        }
    }
} = config;

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog('ALL');
    ns.ui.openTail();
    
    ns.atExit(() => {
        ns.toast('Log Tranager Shutting Down');
    });
    
    while (true) {
        processLogs(automatonLogPort);
        processLogs(purchasingLogPort);
        await ns.sleep(20);
    }

    function processLogs(port) {
        var target = ns.readPort(port);
        if (target !== 'NULL PORT DATA') {
            ns.print(target);
        }
    }
}

