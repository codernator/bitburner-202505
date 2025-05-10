export class ApprovalType {
    static get Approved() { return 'approved'; };
    static get Denied() { return 'denied'; };

    static Parse(code) {
        switch (code) {
            case ApprovalType.Approved:
            case ApprovalType.Denied:
                return code;
            default:
                return null;
        }
    }
}

export class ApprovalReason {
    static get RequisitionsSuspended() { return 'Requisitions Suspended'; };
    static get BuyerLocked() { return 'Buyer Temporarily Locked'; };
    static get BuyerSuspended() { return 'Buyer Suspended'; };
    static get NoAccountant() { return 'No Accountant for Buyer'; };
    static get InsufficientFunds() { return 'Insufficient Funds'; };
    static get InsufficientIncome() { return 'Insufficient Income'; };
    static get PurchaseFailed() { return 'Purchase Failed'; };
    static get Approved() { return 'Approved'; };

    static getWait(reason) {
        switch (reason) {
            case ApprovalReason.RequisitionsSuspended: { return 1_000 * 60 * 1; };
            case ApprovalReason.BuyerLocked: { return 50; };
            case ApprovalReason.BuyerSuspended: { return 1_000 * 60 * 1; };
            case ApprovalReason.NoAccountant: { return 1_000 * 60 * 10; };
            case ApprovalReason.InsufficientFunds: { return 30 * 1_000; };
            case ApprovalReason.InsufficientIncome: { return 1_000 * 60 * 1; };
            case ApprovalReason.PurchaseFailed: { return 40 * 1_000; };
            default: return 0;
        }
    }
}

export class Buyer {
    static get HacknetBuyer() { return 'hacknetbuyer'; };
    static get ServerBuyer() { return 'serverbuyer'; };

    static Parse(code) {
        switch (code) {
            case Buyer.HacknetBuyer:
            case Buyer.ServerBuyer:
                return code;
            default: 
                return null;
        }
    }
};

export class HacknetProduct {
    static get Server() { return 'server' };

    static get Cache() { return 'cache'; };
    static get Core() { return 'core'; };
    static get Level() { return 'level'; };
    static get Ram() { return 'ram'; };

    static Parse(code) {
        switch (code) {
            case HacknetProduct.Server:
            case HacknetProduct.Cache:
            case HacknetProduct.Core:
            case HacknetProduct.Level:
            case HacknetProduct.Ram:
                return code;
            default: 
                return null;
        }
    }
};

export class ServerProduct {
    static get AttackerServer() { return 'attackerserver'; };
    static get AttackerUpgrade() { return 'attackerupgrade'; };
    static get SharerServer() { return 'sharerserver'; };
    static get SharerUpgrade() { return 'sharerupgrade'; };

    static Parse(code) {
        switch (code) {
            case ServerProduct.AttackerServer:
            case ServerProduct.AttackerUpgrade:
            case ServerProduct.SharerServer:
            case ServerProduct.SharerUpgrade:
                return code;
            default: 
                return null;
        }
    }
};
