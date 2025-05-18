import { GoOpponent } from "./lib/enums";

const schema = [
    [ 'f', 'nb' ],  // see GoOpponent.mapShorthand
    [ 's', 5 ],     // 5 | 7 | 9 | 13
    [ 'i', 1 ],     // iterations
    [ 'v', false ], // verbose
]
/** @param {NS} ns */
export async function main(ns) {
    const {
        f: opponent,
        s: size,
        i: iterations,
        v: verbose,
    } = ns.flags(schema);

    ns.clearLog();
    ns.disableLog('ALL');

    const faction = GoOpponent.mapShorthand(opponent);
    if (faction === null) {
        ns.tprint(`Unknown shorthand ${opponent}.`);
        return;
    }
    if ([5,7,9,13].indexOf(size) < 0) {
        ns.tprint(`Invalid board size ${size}.`);
        return;
    }

    for (let n = 0; n < iterations; n++) {
        await randomPlay(ns, faction, size, verbose);
        if (verbose) ns.tprint({ game: ns.go.getGameState() });
    }
}

const player1 = false;
async function randomPlay(ns, faction, size, verbose) {
    ns.go.resetBoardState(faction, size);

    while (true) {
        const moves = [...flatten(ns.go.analysis.getValidMoves(player1))].filter(c => c.valid);
        if (moves.length === 0) {
            const { type } = await ns.go.passTurn(player1);
            if (type === 'gameOver') break;
            continue;
        };

        const { x, y } = moves.sort(_ => Math.random())[0];
        const { type, ax, ay } = await ns.go.makeMove(x, y, player1);
        if (verbose) ns.tprint({ x, y, type, ax, ay });
        if (type === 'gameOver') break;

        await ns.sleep(100);
    }

    function* flatten(moves) {
        for (let x = 0; x < moves.length; x++) {
            for (let y = 0; y < moves[x].length; y++) {
                const valid = moves[x][y];
                yield { x, y, valid };
            }
        }
    }
}