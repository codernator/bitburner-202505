export function validateParens(parens) {
  if (parens.length === 0)
    return false;

  let tracking = 0;
  for (let c of parens.split('')) {
    switch (c) {
      case '(':
        tracking++;
        break;
      case ')':
        if (tracking === 0)
          return false;
        tracking--;
        break;
      default: continue;
    }
  }
  
  return tracking === 0;
}

export function unitTests(ns) {
  ns.tprint('validate Parens');
  ns.tprint('-----------------------------');
  theory([
    { input: '()', expected: true },
    { input: '(()', expected: false },
    { input: '()(', expected: false },
    { input: '(())', expected: true },
    { input: '()(a())', expected: true },
    { input: '(abc)', expected: true },
    { input: '()(a()', expected: false },
  ]);

  function theory(testcases) {
    for (let testcase of testcases) {
      const { input, expected } = testcase;
      const actual = validateParens(input);
      ns.tprint(`${input}: ${(actual === expected ? 'Pass': 'Fail' )}`);
    }
  }
}
