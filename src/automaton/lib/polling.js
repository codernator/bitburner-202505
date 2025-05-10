export const defaults = {
    waitTimeout: 60/*s*/ * 1_000/*ms*/,
    pollSleep: 100/*ms*/,
};

/** @param {NS} ns */
export async function pollWithTimout(ns, reader, waitTimeout = defaults.waitTimeout, pollSleep = defaults.pollSleep) {
    const waitStart = new Date().getTime();
    while (true) {
        if (new Date().getTime() - waitStart > waitTimeout)
            break;

        const response = reader();
        if (response !== 'NULL PORT DATA') return response;

        await ns.sleep(pollSleep);
    }

    return null;
}
