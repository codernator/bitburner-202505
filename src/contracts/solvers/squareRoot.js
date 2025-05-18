const fofx = x => x * x;
const fprimeofx = x => x / 2;
const xofnplus1 = xofn => Math.abs(xofn - fofx(xofn)/fprimeofx(xofn));

export function solve(ns, input, logger = () => {}) {
    throw 'Square Root -- Not Implemented';

    let x = input / 2;
    for (let i = 0; i < 1024; i++) {
        const next = xofnplus1(x);
        ns.tprint({ input, i, next });
        if (Math.abs(next - x) < 0.00000001) {
            return next;
        }
        x = next;
    }
    return null;
}

export function unitTests(ns) {
    ns.tprint("Square Root of a BIGINT");
    ns.tprint("--------------------------");

    theory([
        { input: 100, epxected: 10 },
    ]);

    function theory(testcases) {
        for (let testcase in testcases) {
            const { input, expected } = testcase;
            const actual = solve(ns, input);
            ns.tprint({ input, actual, expected });
        }
    }
}