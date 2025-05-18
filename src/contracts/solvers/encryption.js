// Encryption I: Caesar Cipher
export async function solve1(ns, inputs, logger = () => {}) {
	/*** PASSED ***/
	const a = 'A'.charCodeAt(0);
	const z = 'Z'.charCodeAt(0);
	const plain = inputs[0].toUpperCase();
	const shft = parseInt(inputs[1]);
	const len = plain.length;

	let answer = new Array(len);
	for (let i = 0; i < len; i++) {
		if (plain.charAt(i) == ' ') {
			answer[i] = ' ';
			continue;
		}

		const c = plain.charCodeAt(i);
		const n = c - shft;
		const adj = n < a
			? z + (n - a + 1)
			: n;
		answer[i] = String.fromCharCode(adj);
	}

	return answer.join('');
}


// Encryption II: Vigenère Cipher
export async function solve2(ns, inputs, logger = () => {}) {
	const a = "A".charCodeAt(0);
	const z = "Z".charCodeAt(0);
	const [plain, keyword] = inputs;

	const pu = plain.toUpperCase();
	const ku = keyword.toUpperCase();

	const plainLen = plain.length;
	const keyLen = keyword.length;
	const encyphered = new Array(plainLen);
	for (let i = 0; i < plainLen; i++) {
		const j = i % keyLen;
		const ra = pu.charCodeAt(i);
		const rk = ku.charCodeAt(j);
		const next = ra + (rk - a);
		const adjusted = (next > z)
			? a + (next % (z + 1))
			: next;
		encyphered[i] = String.fromCharCode(adjusted);
	}

	return encyphered.join("");	
}

export async function unitTests(ns) {

}
