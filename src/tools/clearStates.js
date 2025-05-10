import config from '/automaton/.config';
const {
    allPorts: {
        stateCache
    }
} = config;

/** @param {NS} ns */
export async function main(ns) {
    for (let k of Object.keys(stateCache)) {
        const port = stateCache[k];
        ns.clearPort(port);
    }
}
