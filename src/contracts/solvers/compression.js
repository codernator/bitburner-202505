// Compression I: RLE Compression
export async function solve1(ns, inputs, logger = () => {}) {
	const stream = [...countRLE(inputs)];
	return [...encode(stream)].join('');

	function* encode(stream) {
		for (let r of stream) {
			let { letter, count } = r;
			while (count > 9) {
				yield `9${letter}`;
				count -= 9;
			}
			yield `${count}${letter}`;
		}
	}

	function* countRLE(input) {
		let letter = null;
		let count = 0;

		for (let c of input) {
			if (letter === null) {
				letter = c;
				count +=1;
			} else if (letter !== c) {
				yield { letter, count };
				letter = c;
				count = 1;
			} else {
				count += 1;
			}
		}
		yield { letter, count };
	}
}

// Compression II: LZ Decompression
export function solve2(ns, inputs, logger = () => {}) {
    const decoded = [];

    const chunks = [...getChunks(inputs.split(''))];
    for (let chunkData of chunks) {
        const { type, L, X, chunk } = chunkData;
        switch (type) {
            case 'lb': {
                for (let l = 0; l < L; l++) {
                    decoded.push(decoded.at(-X));
                }
                break;
            }
            case 'cp': {
                for (let l = 0; l < L; l++) {
                    decoded.push(chunk[l]);
                }
                break;
            }
            case 'noop': break;
        }
    }

    return decoded.join('');

    function* getChunks(encoded) {
        let index = 0;
        let expectedType = 'cp'
        while (index < encoded.length) {
            const chunk = getChunk(encoded, index, expectedType);
            yield chunk;
            index = chunk.nextIndex;
            expectedType = chunk.nextExpectedType;
        }
    }

    function getChunk(encoded, index, expectedType) {
        const c = encoded[index];
        const L = parseInt(c, 10);
        if (L === 0)
            return { type: 'noop', L, nextIndex: index + 1, nextExpectedType: expectedType === 'lb' ? 'cp' : 'lb' };

        if (expectedType === 'lb') {
            const X = parseInt(encoded[index + 1], 10);
            return { type: 'lb', L, X, nextIndex: index + 2, nextExpectedType: 'cp' };
        } else {
            const chunk = encoded.slice(index + 1, index + L + 1);
            return { type: 'cp', L, chunk, nextIndex: index + L + 1, nextExpectedType: 'lb' }
        }
    }
}

// Compression III: LZ Compression
export async function solve3(ns, inputs, logger = () => {}) {
	throw 'Compression III: LZ Compression -- Not Implemented';
}

export function solve2UnitTests(ns) {
    theories([
        { input: '5aaabb450723abb', answer: 'aaabbaaababababaabb' },
    ]);

    function theories(cases) {
        for (let { input, answer } of cases) {
            const actual = solve2(ns, input);
            ns.tprint({ input, answer, actual, pass: actual === answer });
        }
    }
}
