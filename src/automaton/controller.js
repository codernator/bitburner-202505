import config from './.config';

const {
    controller: {
        modules,
    }
} = config;

const home = 'home';

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.disableLog('ALL');
    
    ns.atExit(() => {
        ns.toast('Automaton Controller Shut Down.');
    });
    
    while (true) {
        for (let { script, createArgs } of modules.filter(m => m.enabled)) {
            if (!ns.scriptRunning(script, home)) {
                ns.exec(script, home, { }, ...createArgs());
            }
        }

        await ns.sleep(25);
    }
}
