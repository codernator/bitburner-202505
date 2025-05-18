import solvers from 'contracts/solvers/index';
import { mapShortHand, solverTestFactory, showMap } from '/contracts/solverFactory.js';
import { unitTests as validatorTests } from '/contracts/lib/validator';

/** @param {NS} ns */
export async function main(ns) {
    const {
        s: which,
        m: displayMap
    } = ns.flags([
        ['s', 'all'],
        ['m', false],
    ]);

    ns.ui.clearTerminal();

    if (displayMap) {
        showMap(ns);
    }
    switch (which) {
        case 'all': await runAllTests(ns); break;
        case 'util': runUtilTests(ns); break;
        default: await runSolverTest(ns, which); break;
    }
}

async function runAllTests(ns) {
    runUtilTests(ns);
    for (let unitTests of solvers.filter(s => s.unitTests).map(s => s.unitTests))
        await unitTests(ns);
}

function runUtilTests(ns) {
    validatorTests(ns);
}

async function runSolverTest(ns, which) {
	const contractType = mapShortHand(which);
    const unitTests = solverTestFactory(contractType);
    if (unitTests) {
        await unitTests(ns);
    } else {
        ns.tprintRaw(`No Unit Tests found for ${contractType} (${which})`);
    }
}
