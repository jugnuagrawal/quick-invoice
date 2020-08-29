import { Inventory } from './inventory';


export class Extra {
    label?: string;
    value?: string;
    type?: string;

    constructor(data?: any) {
        if (data) {
            Object.keys(data).forEach(key => {
                this[key] = data[key];
            });
        }
    }
}

export class ContactInfo {
    name?: string;
    contactNo?: string;
    email?: string;
    state?: string;
    gstn?: string;
    pan?: string;
    address?: string;
    code?: string;
    note?: string;

    constructor(data?: any) {
        if (data) {
            Object.keys(data).forEach(key => {
                this[key] = data[key];
            });
        }
    }
}

export class Invoice {
    _selected?: boolean;
    _id?: string;
    customer?: ContactInfo;
    paid?: string;
    date?: Date;
    invoiceDate?: Date;
    dueDate?: Date;
    paymentType?: string;
    extras?: Array<Extra>;
    items?: Array<Inventory>;
    firm?: ContactInfo;
    note?: string;
    patternId?: string;
    idPattern?: string;
    idPrefix?: string;
    layout?: string;
    columns?: Array<any>;
    constructor(data?: any) {
        if (data) {
            Object.keys(data).forEach(key => {
                if (key === 'firm' || key === 'customer') {
                    this[key] = new ContactInfo(data[key]);
                } else if (key === 'items') {
                    if (data[key]) {
                        this[key] = data[key].map(e => new Inventory(e));
                    } else {
                        this[key] = [];
                    }
                } else if (key === 'extras') {
                    if (data[key]) {
                        this[key] = data[key].map(e => new Extra(e));
                    } else {
                        this[key] = [];
                    }
                } else {
                    this[key] = data[key];
                }
            });
        }
    }
}

