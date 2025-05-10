export default async function solve(ns, input, logger = () => {}) {
    let iterations = 0;
    let maximizer = Number.MIN_SAFE_INTEGER;
    for (let subarray of createSubArrays(input)) {
        const sum = subarray.reduce((p,n) => p + n, 0);
        if (sum > maximizer) maximizer = sum;
        iterations++;
        if (iterations === 1024) {
            await ns.sleep(0);
            iterations = 0;
        }
    }

    return maximizer === Number.MIN_SAFE_INTEGER 
        ? null 
        : maximizer;
}

function* createSubArrays(input) {
    for (let i = 0; i < input.length; i++) {
        for (let j = i; j < input.length; j++) {
            const sliced = input.slice(i, j + 1);
            //ns.tprint({ i, j, sliced });
            yield sliced;
        }
    }
}

export function unitTests(ns) {
    unitTestCreateSubArrays(ns);
}

function unitTestCreateSubArrays(ns) {
  ns.tprint('Answers');
  ns.tprint('-----------------------------');
  theory([
    { inputs: [1,2,3], expected: [[1],[1,2],[1,2,3],[2],[2,3],[3]] },
  ]);

  async function theory(testcases) {
    for (let testcase of testcases) {
      const { inputs, expected } = testcase;
      const actual = [...createSubArrays(inputs, ns)];
      ns.tprint({ inputs, actual, expected });
    }
  }
}