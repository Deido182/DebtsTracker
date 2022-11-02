
export class Amount {
    constructor(
        public quantity: number,
        public isCredit: boolean, 
        public reason: string, 
        public involved: string, 
        public confirmed: boolean = false, // filled by back-end
        public id: string = null, // filled by back-end
        public date: Date = null, // filled by back-end
        public paidOn: Date = null // filled by backend
    ) {}
    
    isNewReceivedDebt(): boolean {
        return !this.isCredit && !this.confirmed && this.paidOn == null;
    }

    isConfirmedDebt(): boolean {
        return !this.isCredit && this.confirmed && this.paidOn == null;
    }

    isPaidDebtToBeConfirmed(): boolean {
        return !this.isCredit && !this.confirmed && this.paidOn != null;
    }

    isNewProposedCredit(): boolean {
        return this.isCredit && !this.confirmed && this.paidOn == null;
    }

    isConfirmedCredit(): boolean {
        return this.isCredit && this.confirmed && this.paidOn == null;
    }

    isPossiblyPaidCredit(): boolean {
        return this.isCredit && !this.confirmed && this.paidOn != null;
    }

    isSettled(): boolean {
        return this.confirmed && this.paidOn != null;
    }
}