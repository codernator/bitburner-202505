import { SpiderScanMode, SpiderScanner } from '/lib/spiderutil.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog();
    ns.ui.openTail();
    const script = "hackman.js";
    const hackserver = "neo-net";
    const weakserver = "max-hardware";
    const growserver = "zer0";
    
    const threads = 8;

    const hackingLevel = ns.getHackingLevel();
  	const servers = [...new SpiderScanner().scan(ns, SpiderScanMode.Hacked)]
      .filter(server => server.requiredHackingSkill <= hackingLevel)
      .filter(server => server.moneyMax > 0)
      .map(server => server.hostname)
      .join(",");

    doit(hackserver, "h");
    doit(weakserver, "w");
    doit(growserver, "g");

    function killit(server) {
      if (ns.scriptRunning(script, server))
        ns.scriptKill(script, server);
    }

    function doit(server, operation) {
      if (ns.scriptRunning(script, server))
        ns.scriptKill(script, server);
      ns.scp(script, server);
      ns.exec(script, server, { preventDuplicates: true, threads }, ...["-o", operation, "-c", threads, "-s", servers] );
    }
}
