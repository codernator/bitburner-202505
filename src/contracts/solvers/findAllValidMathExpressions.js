/*
Input: digits = '123', target = 6
Output: ['1+2+3', '1*2*3']

Input: digits = '105', target = 5
Output: ['1*0+5', '10-5']
*/
export async function solve(ns, inputs, logger = () => {}) {
    logger(`Attempting FAVME with ${inputs}.`);
    const [digitlist, targetValue] = inputs;
    const digits = digitlist.split('').map(c => parseInt(c, 10));

    const combinationsOfTerms = await createCombinationsOfTerms(ns, digits);
    const expressions = await createExpressions(ns, combinationsOfTerms);
    return expressions.filter(x => eval(x) === targetValue);
}


class TermsComboWorkItem {
    constructor(terms, digits) {
        this.terms = terms;
        this.digits = digits;
    }
}
async function createCombinationsOfTerms(ns, originaldigits) {
    if (originaldigits.length === 0)
        return [];
    if (originaldigits.length === 1)
        return [[originaldigits.slice(0)]];
    const combinations = [];
    const workpile = [];
    let iterations = 0;
    
    workpile.push(new TermsComboWorkItem([], originaldigits));
    while (workpile.length > 0) {
        // tight loop protection
        if ((++iterations) === 1000) {
            await ns.sleep(0);
            iterations = 0;
        }
        
        const { terms, digits } = workpile.pop();

        // no digits left means we have a complete combination created from
        // the original digits list.
        if (digits.length === 0) {
            combinations.push(terms);
            continue;
        }
        
        // 1 digits left also means it plus the previous set of terms make 
        // a complete combination from the original digits list.
        if (digits.length === 1) {
            combinations.push([...terms, `${digits[0]}`]);
            continue;
        }

        // take the next digit as a term for the previous list of
        // combinations.
        workpile.push(
            new TermsComboWorkItem(
                [...terms, `${digits[0]}`],
                digits.slice(1)
            )
        );
        
        // no operand is permitted to lead with 0, so 0 is the only operand we 
        // can pull from the front of this particular array of digits.
        if (digits[0] === 0) {
            continue;
        }

        // otherwise, more terms can be created by iteratively combining the 
        // remaining digits, and then creating combinations from what's left 
        // after making a term.
        for (let i = 1; i < digits.length; i++) {
            workpile.push(
                new TermsComboWorkItem(
                    [...terms, digits.slice(0, i+1).join('')],
                    digits.slice(i+1)
                )
            );
        }
    }

    return combinations;
}

class ExpressionsWorkItem {
    constructor(expression, terms) {
        this.expression = expression;
        this.terms = terms;
    }
}
const operators = ['+','-','*'];
async function createExpressions(ns, originalterms) {
    const workpile = [];
    const expressions = [];
    let iterations = 0;

    for (let terms of originalterms) {
        workpile.push(new ExpressionsWorkItem(null, terms));
    }
    while (workpile.length > 0) {
        if ((++iterations) === 1000) {
            await ns.sleep(0);
            iterations = 0;
        }
        
        const { expression, terms } = workpile.pop();
        if (expression === null) {
            if (terms.length > 0) {
                workpile.push(new ExpressionsWorkItem(`${terms[0]}`, terms.slice(1)))
            }
            continue;
        }
        
        if (terms.length === 0) {
            expressions.push(expression);
            continue;
        }

        const nextterm = terms[0];
        const nextterms = terms.slice(1);
        for (let operator of operators) {
            workpile.push(new ExpressionsWorkItem(
                `${expression}${operator}${nextterm}`,
                nextterms
            ))
        }
    }

    return expressions;
}


export async function unitTests(ns) {
    await unitTestCreateExpressions(ns);
    await unitTestCreateCombinationsOfTerms(ns);
    await unitTestAnswers(ns);
}

async function unitTestCreateExpressions(ns) {
    ns.tprint('Expressions');
    ns.tprint('-----------------------------');
    await theory([
        { input: [[1,2,3], [1,23], [12,3], [123]], expected: [] },
        { input: [[1,0,5], [10,5], [105]], expected: [] },
    ]);

    async function theory(testcases) {
        for (let testcase of testcases) {
            const { input, expected } = testcase;
            const actual = await createExpressions(ns, input);
            ns.tprint({ input, actual, expected });
        }
    }
}

async function unitTestCreateCombinationsOfTerms(ns) {
    ns.tprint('Combinations of Terms');
    ns.tprint('-----------------------------');
    await theory([
        { input: [1,2,3], expected: [ [1,2,3], [12, 3], [1, 23], [123], ] },
        { input: [1,0,5], expected: [ [1,0,5], [10,5], [105], ] },
    ]);

    async function theory(testcases) {
        for (let testcase of testcases) {
            const { input, expected } = testcase;
            const actual = await createCombinationsOfTerms(ns, input);
            ns.tprint({ input, actual, expected });
        }
    }
}

async function unitTestAnswers(ns) {
    ns.tprint('Answers');
    ns.tprint('-----------------------------');
    await theory([
        { inputs: ['123', 6], expected: ['1+2+3', '1*2*3'] },
        { inputs: ['105', 5], expected: ['1*0+5', '10-5'] },
    ]);

    async function theory(testcases) {
        for (let testcase of testcases) {
            const { inputs, expected } = testcase;
            const actual = await solve(ns, inputs);
            ns.tprint({ inputs, actual, expected });
        }
    }
}
