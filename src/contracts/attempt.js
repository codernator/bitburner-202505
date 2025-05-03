import solverFactory from '/contracts/solverFactory.js';

/** @param {NS} ns */
export async function main(ns) {
	const [contract, host] = ns.args;

	if (!contract || !host) {
		ns.tprint('invalid command. format is');
		ns.tprint('contracts.js <filename> <hostname>');
		return -1;
	}

	const contractType = ns.codingcontract.getContractType(contract, host)
	const solver = solverFactory(contractType);
	if (!solver) {
		const triesRemaining = ns.codingcontract.getNumTriesRemaining(contract, host);
		ns.tprint(`new contract type ${contractType} ${triesRemaining}`);
		const desc = ns.codingcontract.getDescription(contract, host);
		ns.tprint(desc.replace(/&nbsp;/g, ' '));
		return;
	}

	const inputs = ns.codingcontract.getData(contract, host);
	const triesRemaining = ns.codingcontract.getNumTriesRemaining(contract, host);

  try {
    ns.tprint(`Solving ${contractType} on ${host} with ${inputs}`);
    const answer = await solver(ns, inputs, msg => ns.print(msg));
    ns.tprint(`Attempting: ${contractType} on ${host} WITH ${answer}`);
    const reward = ns.codingcontract.attempt(answer, contract, host);
    if (reward)
      ns.tprint(`${host} ${contract} Success: ${reward}`);
    else
      ns.tprint(`${host} ${contract} Fail: ${triesRemaining} tries remaining.`);
  } catch (e) {
    ns.tprint(`${host} ${contract} ${e}`);
  }
}
