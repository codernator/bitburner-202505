export class GoOpponent{
    static get NoAI() { return "No AI"; };
    static get Netburners() { return "Netburners"; };
    static get SlumSnakes() { return "Slum Snakes"; };
    static get BlackHand() { return "The Black Hand"; };
    static get Tetrads() { return "Tetrads"; };
    static get Daedalus() { return "Daedalus"; };
    static get Illuminati() { return "Illuminati"; };
    static get Mystery() { return "????????????"; };

    static mapShorthand(v) {
        switch (v) {
            case 'no': return GoOpponent.NoAI;
            case 'nb': return GoOpponent.Netburners;
            case 'ss': return GoOpponent.SlumSnakes;
            case 'bh': return GoOpponent.BlackHand;
            case 'ts': return GoOpponent.Tetrads;
            case 'dd': return GoOpponent.Daedalus;
            case 'ii': return GoOpponent.Illuminati;
            case 'my': return GoOpponent.Mystery;
            default: return null;
        }
    }
}