const combatRecruitTask = 'Train Combat';
const hackingRecruitTask = 'Train Hacking';

export const constants = {
    combatRecruitTask,
    hackingRecruitTask,
    namesMenu: [
        'Buttercup',
        'Blossom',
        'Bubbles',
        'Shaundi',
        'Kinzie',
        'Robert Paulson',
        'Brock',
        'The Monarch',
        '24',
        'Shore Leave',
        'Salad Dressing',
        'Bobby',
        'Pesto',
        'Squit',
        'Buffy',
        'Bender',
        'Bill',
        'Ted',
        'Spark',
        'Taz',
    ],
};

export function getRandomName(gang) {
    const existing = new Set(gang.members.map(member => member.name));
    const options = [...constants
        .namesMenu
        .filter(name => !existing.has(name))
        .map(n => [n, Math.random()])
        .sort((a,b) => b[1] - a[1])];

    return options[0][0];
}

const ascensionTiers = [
    [Number.MAX_SAFE_INTEGER, 1.5],
    [10, 2],
    [1, 1.75],
];
export function getAscensionThreshold(multiplier) {
    try {
        return ascensionTiers.filter(tier => multiplier < tier[0])[0][1]
    } catch (e) {
        throw Error(`Can't find tier for ${multiplier}.`, { cause: e })
    }
}

/** @param {NS} ns */
export function getGang(ns) {
    const gangInformation = ns.gang.getGangInformation();
    const recruitTask = gangInformation.isHacking ? hackingRecruitTask : combatRecruitTask;
    const equipment = getEquipment(gangInformation.isHacking);
    const members = getMembers();
    const tasks = getTasks();
    const nextMemberUpgrade = getNextMemberUpgrade(members, equipment.upgrades);
    const nextMemberAugmentation = getNextMemberAugment(members, equipment.augments);

    return ({
        ...gangInformation,
        recruitTask,
        equipment,
        members,
        tasks,
        nextMemberUpgrade,
        nextMemberAugmentation,
    });

    function getTasks() {
        return ns.gang.getTaskNames().map(
            taskName => {
                const stats = ns.gang.getTaskStats(taskName);
                return ({
                    ...stats,
                    taskName,
                });
            }
        );
    }
    
    function getMembers() {
        return ns.gang.getMemberNames().map(
            name => {
                const { 
                    task, 
                    upgrades, 
                    augmentations,
                    hack_asc_mult,
                    str_asc_mult,
                    def_asc_mult,
                    dex_asc_mult,
                    agi_asc_mult,
                    cha_asc_mult,
                } = ns.gang.getMemberInformation(name);
                const ascension = ns.gang.getAscensionResult(name);
                return ({
                    name,
                    task,
                    isTraining: task.startsWith('Train'),
                    upgrades: new Set(upgrades),
                    augmentations: new Set(augmentations),
                    multipliers: {
                        hack: hack_asc_mult,
                        str: str_asc_mult,
                        def: def_asc_mult,
                        dex: dex_asc_mult,
                        agi: agi_asc_mult,
                        cha: cha_asc_mult,
                    },
                    ascension,
                });
            }
        );
    }

    function getEquipment(isHacking) {
        return ns.gang.getEquipmentNames().map(
            name => {
                const stats = ns.gang.getEquipmentStats(name);
                const cost = ns.gang.getEquipmentCost(name);
                const type = ns.gang.getEquipmentType(name);
                const focused = wantForGang(stats, isHacking);
                return ({ 
                    ...stats,
                    name,
                    cost,
                    type,
                    focused,
                });
            }
        ).reduce(
            (p,n) => {
                if (n.type === 'Augmentation')
                    p.augments.push(n);
                else
                    p.upgrades.push(n);
                return p;
            },
            {
                augments: [],
                upgrades: [],
            }
        );
    }

    function wantForGang(stats, isHacking) {
        const props = Object.keys(stats);
        return isHacking
            ? props.includes('hack')
            : props.includes('str') || props.includes('def') || props.includes('dex') || props.includes('agi');
    }


    function getNextMemberUpgrade(members, upgrades) {
        const choices = members
            .filter(member => !member.isTraining)
            .map(member => {
                const { upgrades: owned } = member;
                const unowned = upgrades.filter(e => !owned.has(e.name)).sort(e => e.cost);
                return { 
                    ...member,
                    nextEquipment: unowned.length === 0 ? null : unowned[0],
                };
            })
            .filter(member => member.nextEquipment !== null)
            .sort(member => member.nextEquipment.cost);

        return choices.length === 0 ? null : choices[0];
    }

    function getNextMemberAugment(members, augmentations) {
        const choices = members
            .filter(member => !member.isTraining)
            .map(member => {
                const { augmentations: owned } = member;
                const unowned = augmentations.filter(e => !owned.has(e.name)).sort(e => e.cost);
                return { 
                    ...member,
                    nextAugmentation: unowned.length === 0 ? null : unowned[0],
                };
            })
            .filter(member => member.nextAugmentation !== null)
            .sort(member => member.nextAugmentation.cost);

        return choices.length === 0 ? null : choices[0];
    }
}

