import { getGang, getAscensionThreshold, getRandomName } from '/lib/gangutil';

const schema = [
    ['logport', 0], // port on which to send log messages
    ['reqport', 0], // port on which to send requisition
    ['ackport', 0], // prot on which to listen for requisition responses
];

/** @param {NS} ns */
export async function main(ns) {
    const {
        ackport,
        logport,
        reqport,
    } = ns.flags(schema);
    const logger = msg => ns.writePort(logport, msg);
    const requestor = request => ns.writePort(reqport, JSON.stringify(request));
    const respondee = () => ns.readPort(ackport);

    const gang = getGang(ns);

    recruit(ns, gang, logger);
    ascend(ns, gang, logger);
}


function recruit(ns, gang, logger) {
    if (!ns.gang.canRecruitMember())
        return;

    const name = getRandomName();
    const success = ns.gang.recruitMember(name);
    if (!success)
        logger(`failed to recruit member ${name}`);
    else
        ns.gang.setMemberTask(name, gang.recruitTask);
}

const properties = ['hack', 'str', 'agi', 'def', 'dex', 'cha'];
function ascend(ns, gang, logger) {
    for (let member of gang.members) {
        if(!member.task.startsWith('Train')) continue;

        for (let property of properties) {
            const multiplier = member.multipliers[property];
            const ascension = member.ascension?.[property];
            if (!ascension) continue;

            const threshold = getAscensionThreshold(multiplier);
            if (ascension >= threshold) {
                ns.gang.ascendMember(member.name);
                logger(`Ascending ${member.name} on ${property} = ${multiplier}, ${ascension}, ${threshold}`);
                break;
            }
        }
    }
}
