import { SpiderScanMode, SpiderScanner } from '/lib/spiderutil.js';

/** @param {NS} ns */
export async function main(ns) {
	const { r: plzreport, x: plzexecute } = ns.flags([
		['r', true],
		['x', false]
	]);
	const contracts = [...getContracts(ns, new SpiderScanner())];
	if (plzreport)
		reportContracts(ns, contracts);
	if (plzexecute)
		await executeContracts(ns, contracts);
}

function* getContracts(ns, scanner) {
	for (let { hostname } of scanner.scan(ns, SpiderScanMode.Hacked)) {
		for (let filename of ns.ls(hostname, '.cct')) {
			yield { hostname, filename }
		}
	}
}

function reportContracts(ns, contracts) {
	ns.ui.clearTerminal();
	ns.tprint('Contracts Found');
	ns.tprint('---------------');
	for (let { hostname, filename } of contracts) {
		ns.tprint(`run /contracts/attempt.js ${filename} ${hostname}`);
	}
	ns.tprint('---------------');
}

async function executeContracts(ns, contracts) {
	const attempter = '/contracts/attempt.js';
	const svchost = 'home';
	for (let { hostname, filename } of contracts) {
		ns.tprint(`Attempting ${filename} on ${hostname}`);
		const pid = ns.exec(attempter, svchost, { threads: 1 }, ...[filename, hostname]);
		while(ns.isRunning(pid, svchost))
			await ns.sleep(100);
	}
}
