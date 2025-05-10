import { ApprovalReason, ApprovalType } from "./enums";
export default class RequisitionResponse {
    static Denied(reason, requisition, cost = null) {
        return new RequisitionResponse(
            ApprovalType.Denied,
            reason,
            requisition,
            cost,
            ApprovalReason.getWait(reason)
        );
    }

    static Approved(requisition, cost) {
        return new RequisitionResponse(
            ApprovalType.Approved,
            ApprovalReason.Approved,
            requisition,
            cost,
            0
        );
    }

    constructor(approvalType, reason, requisition, cost, wait) {
        this.approvalType = approvalType;
        this.reason = reason;
        this.requisition = requisition;
        this.cost = cost;
        this.wait = wait;
    }
}
