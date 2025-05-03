import ObjectSet from '/lib/objectSet.js';

export const getNumOpeners = ns => 
	(ns.fileExists('FTPCrack.exe', 'home') ? 1 : 0)
	+ (ns.fileExists('BruteSSH.exe', 'home') ? 1 : 0)
	+ (ns.fileExists('relaySMTP.exe', 'home') ? 1 : 0)
	+ (ns.fileExists('HTTPWorm.exe', 'home') ? 1 : 0)
	+ (ns.fileExists('SQLInject.exe', 'home') ? 1 : 0);

export class SpiderScanMode {
	static get All() { return 'all' };
	// only report locked servers
	static get Locked() { return 'locked' };
	// only report hacked servers
	static get Hacked() { return 'hacked' };
	static get HackedNoBd() { return 'hacked-nobd' };

	static parse(name) {
		switch (name.toLowerCase()) {
			case 'all': return SpiderScanMode.All;
			case 'locked': return SpiderScanMode.Locked;
			case 'hacked': return SpiderScanMode.Hacked;
			case 'hacked-nobd': return SpiderScanMode.HackedNoBd;
			case 'nbd': return SpiderScanMode.HackedNoBd;
			default: return SpiderScanMode.All;
		};
	}
};

// safetyNet is a "just in case" limiter to prevent an infinite loop in the scan method breaking Bitburner.
const safetyNet = 512;
export class SpiderScanner {
	constructor() {
		this.needScan = new ObjectSet(t => t.Key);
		this.needScan.add(new ScanTarget('home', [], 0));
		this.hacked = [];
	}

	*scan(ns, scanMode) {
		const map = (server, scanTarget, hacked) => ({
			...scanTarget.Object,
			...server,
			hacked,
			'ramAvail': server.maxRam - server.ramUsed,
      'moneyAvailable': typeof server.moneyAvailable === 'undefined'
        ? ns.getServerMoneyAvailable(server.hostname)
        : server.moneyAvailable,
			'requiredHackingSkill': typeof server.requiredHackingSkill === 'undefined'
				? ns.getServerRequiredHackingLevel(server.hostname) 
				: server.requiredHackingSkill,
			'numOpenPortsRequired': typeof server.numOpenPortsRequired === 'undefined' 
				? ns.getServerNumPortsRequired(server.hostname) 
				: server.numOpenPortsRequired,
		});

		const alreadySeen = new Set(this.hacked.map(h => h.hostname));
		const needReScan = new ObjectSet(t => t.Key);
		let scanStack = [...this.needScan];

		if (scanMode === SpiderScanMode.All || scanMode === SpiderScanMode.Hacked || scanMode === SpiderScanMode.HackedNoBd) {
			for (let scanTarget of this.hacked) {
				const server = ns.getServer(scanTarget.hostname);
				if (scanMode !== SpiderScanMode.HackedNoBd || !server.backdoorInstalled)
					yield map(server, scanTarget, true);
			}
		}

		while (scanStack.length) {
			const scanTarget = scanStack.pop();
			if (scanTarget.Depth > safetyNet) {
				ns.tprint("Spider Scan max depth reached!");
				break;
			}
			const hostname = scanTarget.Host;
			if (hostname === 'home') {
				scanStack = [...scanStack, ...ns.scan(hostname).map(m => new ScanTarget(m, [], 0))];
				alreadySeen.add('home');
				continue;
			}

			const server = ns.getServer(hostname);
			if (server.purchasedByPlayer) // don't ever want to see these
				continue;
			const hacked = ns.hasRootAccess(hostname);
			const result = map(server, scanTarget, hacked);

			if (hacked) {
				this.hacked.push(scanTarget);
				alreadySeen.add(result.hostname);
				const newPath = [...scanTarget.Path, hostname];
				const newDepth = scanTarget.Depth + 1;
				scanStack = [...scanStack, ...ns.scan(hostname).filter(m => !alreadySeen.has(m)).map(m => new ScanTarget(m, newPath, newDepth))];
			} else {
				needReScan.add(scanTarget);
			}

			switch (scanMode) {
				case SpiderScanMode.All:
					yield result;
					break;
				case SpiderScanMode.Hacked:
					if (hacked)
						yield result;
					break;
				case SpiderScanMode.Locked:
					if (!hacked)
						yield result;
					break;
				case SpiderScanMode.HackedNoBd:
					if (hacked && !result.backdoorInstalled)
						yield result;
					break;
			}
		}

		this.needScan.clear();
		this.needScan = needReScan;
	}
}

class ScanTarget {
	constructor(hostname, path, depth) {
		this.hostname = hostname;
		this.path = path;
		this.depth = depth;
	}

	get Key() { return this.hostname.replace(new RegExp('[\.\/-]', 'g'), '_'); }
	get Host() { return this.hostname; }
	get Path() { return this.path; }
	get Depth() { return this.depth; }
	get Parent() { return this.path.length ? this.path[this.path.length-1] : ''; }
	get Object() { return { 'hostname': this.hostname, 'path': this.path, 'depth': this.depth, 'parent': this.Parent } }
}
