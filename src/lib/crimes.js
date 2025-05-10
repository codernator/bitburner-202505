import enums from './ns/enums';
const { CrimeType } = enums;

export default crimes = [
	{ crime: CrimeType.assassination, time:300000, karmaPS:0.000033333333333333335 },
	{ crime: CrimeType.bondForgery, time:300000, karmaPS:3.3333333333333335e-7 },
	{ crime: CrimeType.dealDrugs, time:10000, karmaPS:0.00005 },
	{ crime: CrimeType.grandTheftAuto, time:80000, karmaPS:0.0000625 },
	{ crime: CrimeType.heist, time:600000, karmaPS:0.000025 },
	{ crime: CrimeType.homicide, time:3000, karmaPS:0.001 },
	{ crime: CrimeType.kidnap, time:120000, karmaPS:0.00005 },
	{ crime: CrimeType.larceny, time:90000, karmaPS:0.000016666666666666667 },
	{ crime: CrimeType.mug, time:4000, karmaPS:0.0000625 },
	{ crime: CrimeType.robStore, time:60000, karmaPS:0.000008333333333333334 },
	{ crime: CrimeType.shoplift, time:2000, karmaPS:0.00005 },
	{ crime: CrimeType.traffickArms, time:40000, karmaPS:0.000025 },
];
