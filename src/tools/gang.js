import { getGang } from '../lib/gangutil';
import { Formatters, Justify, Grid, Column } from '../lib/gridview';

/** @param {NS} ns */
export async function main(ns) {
    const gang = getGang(ns);
    const grid = new Grid(
        [
            new Column('name', 'Member Name', Formatters.stringFormatter, 0, 20, Justify.Left),
            new Column('hack', 'Hack Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
            new Column('str', 'Str Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
            new Column('def', 'Def Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
            new Column('agi', 'Agi Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
            new Column('dex', 'Dex Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
            new Column('cha', 'Cha Mult', Formatters.numberFormatter(ns), 10, 1, Justify.Right),
        ],
        _ => _,
        2
    );

    const data = gang.members.map(member => ([
        {
            name: member.name,
            ...member.multipliers,
        },
        {
            name: '',
            ...member.ascension,
        }
    ]))
    .reduce((p, n) => ([...p, ...n]), []);

    const rended = grid.create(data);

    ns.ui.clearTerminal();
    ns.tprintRaw(rended);
}
