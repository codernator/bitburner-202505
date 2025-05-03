const schema = [
	[ 'r', false],     // when specified, overrides all other commands to attempt to root
                     // any target servers that are available based on the number of 
                     // port openers owned.
	[ 'p', null],      // if specified, will show the path to a given server (if known), 
	                   // and the regular report is ingored.
	[ 'm', 'locked' ], // hacked, locked, all, hbd (hacked-nobd), contracts, messages
	                   // if 'hbd', then sort is automatically 'depth ascending', the
                     // > display is a list of commands to initiate a backdoor on the
                     // > target server, and the flags 'p', 's', and 'd' are ignored.
                     // if contracts, then list all hacked servers & filenames for all that have contracts.
                     // if messages, then list all hacked servers & filenames for all that have message files.
	[ 's', 'name'],    // name, level, ports, money, depth
	[ 'd', false],     // false for ascending, true for descending
];
import { SpiderScanMode, SpiderScanner, getNumOpeners } from '/lib/spiderutil';
import Nuker from '/tools/nuker';

/** @param {NS} ns */
export async function main(ns) {
	const flags = ns.flags(schema);
	ns.disableLog("ALL");

	const mode = SpiderScanMode.parse(flags.m);
	if (flags.r)
		await rootAvailable(ns);
	else if (flags.p)
		reportPath(ns, flags.p);
	else if (mode === SpiderScanMode.HackedNoBd)
		reportNbd(ns); 
	else
		report(ns, mode, getSortFunc(ns, flags.s, flags.d));
}

async function rootAvailable(ns) {
	const numOpeners = getNumOpeners(ns);
	const nuker = new Nuker();
	const scanner = new SpiderScanner();
	while (true) {
		const scans = [...scanner.scan(ns, SpiderScanMode.Locked)].filter(s => numOpeners >= s.numOpenPortsRequired);
		if (scans.length === 0) {
			ns.tprint(`All possible targets have been rooted with the ${numOpeners} openers available.`);
			return;
		}

		for (let server of scans)
			nuker.attack(ns, server);

		await ns.sleep(500);
	}
}

function reportPath(ns, target) {
	const scanner = new SpiderScanner();
	const cased = target.toLowerCase();
	const scans = [...scanner.scan(ns, SpiderScanMode.All)].filter(s => s.hostname.toLowerCase() === cased)
	if (!scans || !scans.length) {
		ns.tprint(`Target ${target} is not known.`);
		return;
	}
	const [{ path }] = scans;
	for (let i in path) {
		ns.tprint(`${'>'.padStart(i * 3, ' ')} ${path[i]}`);
	}
	ns.tprint(`${'>'.padStart(path.length * 3, ' ')} ${target}`);
	ns.tprint(`connect ${path.join(';connect ')};connect ${target}`);
}

function getSortFunc(ns, s, d) {
	switch (s.toLowerCase()) {
		case 'name':
			return stringSortFunc(ns, 'hostname', d);
		case 'parent':
			return stringSortFunc(ns, 'parent', d);
		case 'level':
			return valueSortFunc(ns, 'requiredHackingSkill', d);
		case 'ports':
			return valueSortFunc(ns, 'numOpenPortsRequired', d);
		case 'money':
			return valueSortFunc(ns, 'moneyMax', d);
		case 'depth':
			return valueSortFunc(ns, 'depth', d);
    case 'ram':
      return valueSortFunc(ns, 'maxRam', d);
		default:
			return () => 0;
	}
}

function stringSortFunc(ns, field, d) {
	if (d)
		return (a,b) => b[field].localeCompare(a[field]);

	return (a,b) => a[field].localeCompare(b[field]);
}

function valueSortFunc(ns, field, d) {
	return d
		? (a,b) => b[field] - a[field]
		: (a,b) => a[field] - b[field];
}

function reportNbd(ns) {
	const hackingLevel = ns.getHackingLevel();
	const scans = getScans();
	ns.ui.clearTerminal();
	for (let { hostname, depth, parent } of scans) {
		if (depth === 0)
			ns.tprint(`home; connect ${hostname}; backdoor`);
		else
			ns.tprint(`connect ${parent}; connect ${hostname}; backdoor /* ${depth} */`);
	}

	function getScans() {
		const scanner = new SpiderScanner();
		const scans = [...scanner.scan(ns, SpiderScanMode.HackedNoBd)].filter(server => hackingLevel >= server.requiredHackingSkill);
		scans.sort(getSortFunc(ns, 'depth', false));
		return scans;
	}
}

function getTitle(mode) {
	switch (mode) {
		case SpiderScanMode.All:
			return "Known Servers";
		case SpiderScanMode.Locked:
			return "Known Servers Not Hacked";
		case SpiderScanMode.Hacked:
			return "Hacked Servers";
		case SpiderScanMode.HackedNoBd:
			return "Need Backdoor Installed";
		default:
			return `QtF: ${mode}`;
	}
}

function report(ns, mode, sortFunc) {
	const title = getTitle(mode);
	const hackingLevel = ns.getHackingLevel();
	const numOpeners = getNumOpeners(ns);
	const scans = getScans();

	ns.tprint(title);
	ns.tprint('-'.padEnd(title.length, '-'));
	ns.tprint('  Host               Level Ports             Max Money      RAM     Used  Depth Parent');
	for (let { hostname, requiredHackingSkill, numOpenPortsRequired, moneyMax, maxRam, ramUsed, depth, parent, hacked, backdoorInstalled } of scans) {
		const hackable = hacked 
			? backdoorInstalled ? 'b' : (hackingLevel >= requiredHackingSkill ? '+' : 'o')
			: numOpeners > numOpenPortsRequired 
				? '?'
				: '-';
		const h = hostname.padEnd(18);
		const l = requiredHackingSkill.toString().padStart(5);
		const p = numOpenPortsRequired.toString().padStart(5);
		const m = ns.formatNumber(moneyMax, 2).padStart(21);
    const r = ns.formatNumber(maxRam, 2).padStart(8);
    const u = ns.formatNumber(ramUsed, 2).padStart(8);
		const d = depth.toString().padStart(6);
		ns.tprint(`${hackable} ${h} ${l} ${p} ${m} ${r} ${u} ${d} ${parent}`)
	}

	function getScans() {
		return [...new SpiderScanner().scan(ns, mode)].sort(sortFunc);
	}
}
