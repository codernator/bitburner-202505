import solvers from '/contracts/solvers/index';

export default function solverFactory(contractType) {
	for (let solver of solvers) {
		const {name, method} = solver;
		if (name === contractType)
			return method;
	}
	return null;
}

export function solverTestFactory(contractType) {
	for (let solver of solvers) {
		const {name, unitTests} = solver;
		if (name === contractType)
			return unitTests;
	}
	return null;
}

export function mapShortHand(ct) {
	for (let solver of solvers) {
		const {name, shortcut} = solver;
		if (shortcut === ct)
			return name;
	}
	return ct;
}

export function showMap(ns) {
	for (let solver of solvers.sort((s1, s2) => s1.name.localeCompare(s2.name))) {
		const { name, shortcut, method, unitTests } = solver;
		ns.tprintRaw(`${name}, ${shortcut}, ${(!method ? 'NULL' : 'OK')}, ${(!unitTests ? 'NULL' : 'OK')}`);
	}
}
