import config from '/automaton/.config';
import StateMan from '/automaton/lib/stateman';

const {
  controller: {
    queuePort,
    ackPort,
    logPort,
    modules,
  }
} = config;
const home = 'home';

/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL");
  ns.ui.openTail();

  ns.clearPort(queuePort);
  ns.clearPort(ackPort);
  ns.clearPort(logPort);
  
  const stateMan = new StateMan(ns);
  
  ns.atExit(() => {
    stateMan.save(ns);
    ns.toast('Automaton Controller Shut Down.');
  });
  
  while (true) {
    for (let { script, createArgs } of modules.filter(m => m.enabled)) {
      if (!ns.scriptRunning(script, home)) {
        ns.exec(script, home, { }, ...createArgs(stateMan));
      }
    }

    processLogs();
    processQueues();
    processAcks();

    await ns.sleep(100);
  }

  function processLogs() {
      var target = ns.readPort(logPort);
      while (target != "NULL PORT DATA") {
        ns.print(target);
        target = ns.readPort(logPort);
      }
  }

  function processQueues() {
      var target = ns.readPort(queuePort);
      while (target != "NULL PORT DATA") {
        ns.print(`Locking ${target}.`);
        const item = StateMan.deserializeOne(target);
        stateMan.track(ns, item);
        target = ns.readPort(queuePort);
      }
  }

  function processAcks() {
      var target = ns.readPort(ackPort);
      while (target != "NULL PORT DATA") {
        const item = StateMan.deserializeOne(target);
        ns.print({ action: `Releasing ${target}.`, item });
        stateMan.untrack(ns, item);
        target = ns.readPort(ackPort);
      }
  }
}
