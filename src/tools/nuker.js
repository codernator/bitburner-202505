export default class Nuker {
	attack(ns, server) {
		const {
			hostname: target, 
			ftpPortOpen,
			httpPortOpen,
			smtpPortOpen,
			sqlPortOpen,
			sshPortOpen 
    } = server;

		if (!sshPortOpen && ns.fileExists("BruteSSH.exe", 'home'))
			ns.brutessh(target);
		if (!ftpPortOpen && ns.fileExists("FTPCrack.exe", 'home'))
			ns.ftpcrack(target);
		if (!smtpPortOpen && ns.fileExists("relaySMTP.exe", 'home'))
			ns.relaysmtp(target);
		if (!httpPortOpen && ns.fileExists("HTTPWorm.exe", 'home'))
			ns.httpworm(target);
		if (!sqlPortOpen && ns.fileExists("SQLInject.exe", 'home'))
			ns.sqlinject(target);

		const { openPortCount, numOpenPortsRequired } = ns.getServer(target);

		if (openPortCount < numOpenPortsRequired) {
			ns.print(`Not enough ports to hack ${target} (${counter} ${ports})`);
			return -1;
		}
		
		if (ns.fileExists("NUKE.exe", 'home')) {
			ns.nuke(target);
		}

		if (ns.hasRootAccess(target)) {
			ns.print("Hacked " + target);
			return 0;
		} else {
			ns.print("Failed to hack " + target);
			return -1;
		}
	}	

	checkCondition(ns, server, numOpeners) {
		const { hacked, numOpenPortsRequired } = server;
		return !hacked && numOpeners >= numOpenPortsRequired;
	}	
}
