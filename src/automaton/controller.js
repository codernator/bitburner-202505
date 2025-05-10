import config from './.config';
import StateCache from './lib/stateCache';

const {
    controller: {
        modules,
        lockDuration,
        ports: {
            queuePort,
            ackPort,
            logPort,
            hackerStatePort,
        },
    }
} = config;

const home = 'home';

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog('ALL');
    ns.ui.openTail();

    ns.clearPort(queuePort);
    ns.clearPort(ackPort);
    ns.clearPort(logPort);
    
    const stateCache = new StateCache(
        StateCache.createDefaultUnPersistFunc(ns, hackerStatePort),
        StateCache.createDefaultPersistFunc(ns, hackerStatePort),
        ns
    );
    
    ns.atExit(() => {
        stateCache.save();
        ns.toast('Automaton Controller Shut Down.');
    });
    
    while (true) {
        for (let { script, createArgs } of modules.filter(m => m.enabled)) {
            if (!ns.scriptRunning(script, home)) {
                ns.exec(script, home, { }, ...createArgs(stateCache));
            }
        }

        processLogs();
        processQueues();
        processAcks();

        stateCache.invalidate();

        await ns.sleep(25);
    }

    function processLogs() {
        var target = ns.readPort(logPort);
        if (target !== 'NULL PORT DATA') {
            ns.print(target);
        }
    }

    function processQueues() {
        var target = ns.readPort(queuePort);
        if (target !== 'NULL PORT DATA') {
            ns.print(`Locking ${target}.`);
            const value = JSON.parse(target);
            stateCache.track(ns, value, lockDuration);
        }
    }

    function processAcks() {
        var target = ns.readPort(ackPort);
        if (target !== 'NULL PORT DATA') {
            const value = JSON.parse(target);
            ns.print({ action: `Releasing ${target}.`, value });
            stateCache.untrack(ns, value);
        }
    }
}
