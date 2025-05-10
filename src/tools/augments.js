import enums from '/lib/ns/enums';

/** @param {NS} ns */
export async function main(ns) {
	const { b: buy } = ns.flags([
		[ 'b', false ],
	]);

	ns.ui.clearTerminal();
	let available = getAvailable(ns);
	if (buy) {
		const [{ augmentation, faction }] = available;
		ns.singularity.purchaseAugmentation(faction, augmentation);
		available = getAvailable(ns, factions);
	}

	for (let { augmentation, faction, price } of available)
		ns.tprintRaw(`${faction}  ${augmentation}  ${ns.formatNumber(price, 0)}`);
}

function getAvailable(ns) {
	const owned = new Set(ns.singularity.getOwnedAugmentations(true));
	const { money } = ns.getPlayer();

	return Object.keys(enums.FactionName).map(k => {
		const faction = enums.FactionName[k];
		const augs = ns.singularity.getAugmentationsFromFaction(faction);
		const rep = ns.singularity.getFactionRep(faction);
		return augs.map(augmentation => {
			const price = ns.singularity.getAugmentationPrice(augmentation);
			const repreq = ns.singularity.getAugmentationRepReq(augmentation);
			const prereq = new ns.singularity.getAugmentationPrereq(augmentation);
			return {
				augmentation,
				faction,
				rep,
				price,
				repreq,
				prereq
			};
		});
	})
	.reduce((prev, faction) => [...prev, ...faction] , [])
	.filter(aug => 
			aug.rep >= aug.repreq 
			&& !owned.has(aug.augmentation) 
			&& (aug.prereq.length === aug.prereq.filter(p => owned.has(p)).length)
			&& money >= aug.price)
	.sort((a,b) => b.price - a.price);
}
