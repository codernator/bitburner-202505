export class AttackerProduct {
    static get Server() { return 'server'; };
    static get Upgrade() { return 'upgrade'; };
};

export class ApprovalType {
    static get Approved() { return 'approved'; };
    static get Purchased() { return 'purchased'; };
    static get Denied() { return 'denied'; };
    static get Suspended() { return 'disabled'; };
    static get Erroneous() { return 'erroneous'; };
}

export class Buyer {
    static get HacknetNodeBuyer() { return 'hacknetnodebuyer'; };
    static get HacknetUpgradeBuyer() { return 'hacknetupgradebuyer'; };
    static get WaresBuyer() { return 'waresbuyer'; };
    static get SharerNodeBuyer() { return 'sharernodebuyer'; };
    static get SharerUpgradeBuyer() { return 'sharerupgradebuyer'; };
    static get AttackerBuyer() { return 'attackerbuyer'; };
};

export class HacknetProduct {
    static get Level() { return 'level'; };
    static get Ram() { return 'ram'; };
    static get Core() { return 'core'; };
    static get Cache() { return 'cache'; };
};

export class SharerProduct {
    static get Server() { return 'server'; };
    static get Upgrade() { return 'upgrade'; };
};
