import { Buyer } from '../lib/enums';

import AttackerAccountant from './attackerAccountant';
import HacknetAccountant from './hacknetAccountant';
import ScriptAccountant from './scriptAccountant';
import SharerAccountant from './sharerAccountant';

const attackerAccountant = new AttackerAccountant();
const hacknetAccountant = new HacknetAccountant();
const scriptAccountant = new ScriptAccountant();
const sharerAccountant = new SharerAccountant();

export const buyerAccountantMap = {
    [Buyer.HacknetNodeBuyer]: hacknetAccountant,
    [Buyer.HacknetUpgradeBuyer]: hacknetAccountant,
    [Buyer.WaresBuyer]: null,
    [Buyer.SharerNodeBuyer]: sharerAccountant,
    [Buyer.SharerUpgradeBuyer]: sharerAccountant,
    [Buyer.AttackerBuyer]: attackerAccountant,
};

export const accountants = [
    attackerAccountant,
    hacknetAccountant,
    scriptAccountant,
    sharerAccountant,
];

export { default as AttackerAccountant } from './attackerAccountant';
export { default as HacknetAccountant } from './hacknetAccountant';
export { default as ScriptAccountant } from './scriptAccountant';
export { default as SharerAccountant } from './sharerAccountant';
