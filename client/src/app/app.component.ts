import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import * as inrInWords from 'inr-in-words';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  invoiceData: any;
  private subscriptions: {
    [key: string]: Subscription;
  };
  constructor(private http: HttpClient, private datePipe: DatePipe, private cdr: ChangeDetectorRef) {
    const self = this;
    self.invoiceData = {};
    self.subscriptions = {};
  }

  ngOnInit() {
    const self = this;
    self.invoiceData.invoiceDate = self.datePipe.transform(new Date(), 'yyyy-MM-dd');
    self.invoiceData.firm = {};
    self.invoiceData.billTo = {};
    self.invoiceData.shipTo = {};
    self.invoiceData.items = [];
    self.invoiceData.extras = [];
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  newItem() {
    const self = this;
    self.invoiceData.items.push({
      price: 0,
      quantity: 0,
      discount: 0,
      sgst: 0,
      cgst: 0,
      igst: 0
    });
    self.cdr.detectChanges();
  }

  removeItem(index: number) {
    const self = this;
    self.invoiceData.items.splice(index, 1);
  }

  addExtra() {
    const self = this;
    if (self.invoiceData.extras.length === 4) {
      return;
    }
    self.invoiceData.extras.push({
      label: '',
      value: 0
    });
  }

  removeExtra(index: number) {
    const self = this;
    self.invoiceData.extras.splice(index, 1);
  }

  getExtraValue(data: any) {
    const self = this;
    const totalAmount = self.subTotalAmount + self.totalCGST + self.totalSGST;
    let amount = 0;
    try {
      if (data.type && data.type === 'PERCENT') {
        amount = parseFloat(((totalAmount * parseFloat(data.value)) / 100) + '');
      } else {
        amount = parseFloat(data.value);
      }
    } catch (e) {
      amount = 0;
    }
    return self.roundOff(amount);
  }

  parseExtraValue(data: any) {
    const self = this;
    if (data.value && data.value.endsWith('%')) {
      const temp = data.value.substring(0, data.value.indexOf('%'));
      data.value = self.roundOff(self.subTotalAmount * parseFloat(temp) / 100) + '';
    } else if (!data.value) {
      data.value = '0';
    }
  }

  getNewPrice(item: any) {
    if (!item.discount) {
      item.discount = 0;
    }
    const newPrice = item.price - (item.price * item.discount / 100);
    return newPrice;
  }

  addRoundOff() {
    const self = this;
    const celingNo = Math.ceil(self.totalAmount);
    self.invoiceData.extras.push({
      label: 'Round Off',
      value: (Math.round((celingNo - self.totalAmount) * 100) / 100) + ''
    });
  }

  generate() {
    const self = this;
    const payload = JSON.parse(JSON.stringify(self.invoiceData));
    payload.totalAmount = self.totalAmount;
    self.subscriptions.save = self.http.post('/invoice', payload).subscribe((res: any) => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

  roundOff(num: number) {
    return parseFloat(num.toFixed(2));
  }

  getPriceWithGST(item: any) {
    const self = this;
    const itemTotal = self.getItemTotal(item);
    return self.roundOff(itemTotal / item.quantity);
  }

  setPriceWithGST(value: number, item: any) {
    const self = this;
    const fraction = (1 - item.discount / 100) * (1 + item.sgst / 100 + item.cgst / 100 + item.igst / 100);
    item.price = parseFloat((value / fraction).toFixed(2));
  }

  getItemTaxable(item: any) {
    const self = this;
    const newPrice = self.getNewPrice(item);
    return self.roundOff(item.quantity * newPrice);
  }

  getItemTaxAmt(item: any, tax: string) {
    const self = this;
    const taxable = self.getItemTaxable(item);
    if (!item[tax]) {
      item[tax] = 0;
    }
    return self.roundOff(((item[tax] || 0) * taxable) / 100);
  }

  getItemTotal(item: any) {
    const self = this;
    const taxable = self.getItemTaxable(item);
    const sgstAmt = self.getItemTaxAmt(item, 'sgst');
    const cgstAmt = self.getItemTaxAmt(item, 'cgst');
    const igstAmt = self.getItemTaxAmt(item, 'igst');
    return self.roundOff(taxable + sgstAmt + cgstAmt + igstAmt);
  }

  inWords(num: number) {
    return inrInWords.convert(num);
  }

  get pages() {
    const self = this;
    const items = JSON.parse(JSON.stringify(self.invoiceData.items));
    const pages = [];
    let i;
    let flag = 1;
    let height = 0;
    while (flag) {
      height = 0;
      for (i = 0; i < items.length; i++) {
        const item = items[i];
        item.description = '';
        const noOfLines = Math.ceil(parseFloat((item.description.length / 34).toFixed(1)));
        height += (noOfLines * 14);
        if (items.length > i + 1) {
          const nextItem = items[i + 1];
          nextItem.description = '';
          const nextItemHeight = (Math.ceil(parseFloat((nextItem.description.length / 34).toFixed(1))) * 14);
          if (height + nextItemHeight > 318) {
            break;
          }
        }
      }
      pages.push(items.splice(0, i));
      if (items.length === 0) {
        flag = 0;
      }
    }
    return pages.length;
  }

  get taxGroups(): Array<TaxGroup> {
    const self = this;
    const arr: Array<TaxGroup> = [];
    self.invoiceData.items.forEach(item => {
      let taxIndex = -1;
      let taxGroup: TaxGroup = {
        rate: item.cgst || item.sgst || item.igst,
        sgstAmount: 0,
        cgstAmount: 0,
        igstAmount: 0,
        taxableAmount: 0,
        totalTax: 0
      };
      taxIndex = arr.findIndex(e => e.rate === (item.cgst || item.sgst || item.igst));
      if (taxIndex > -1) {
        taxGroup = arr[taxIndex];
        arr.splice(taxIndex, 1);
      }
      taxGroup.sgstAmount += self.getItemTaxAmt(item, 'sgst');
      taxGroup.cgstAmount += self.getItemTaxAmt(item, 'cgst');
      taxGroup.igstAmount += self.getItemTaxAmt(item, 'igst');
      taxGroup.taxableAmount += self.getItemTaxable(item);
      taxGroup.totalTax += taxGroup.sgstAmount + taxGroup.cgstAmount + taxGroup.igstAmount;
      if (item.cgst || item.sgst || item.igst) {
        arr.push(taxGroup);
      }
    });
    return arr;
  }

  get totalQuantity() {
    const self = this;
    let qty = 0;
    self.invoiceData.items.forEach(item => {
      qty += item.quantity;
    });
    return qty;
  }

  get subTotalAmount() {
    const self = this;
    let amount = 0;
    self.invoiceData.items.forEach(item => {
      amount += self.getItemTotal(item);
    });
    return amount;
  }

  get totalAmount() {
    const self = this;
    let amount = self.subTotalAmount;
    self.invoiceData.extras.forEach(ext => {
      amount += self.getExtraValue(ext);
    });
    return amount;
  }

  get totalTaxable() {
    const self = this;
    let amount = 0;
    self.invoiceData.items.forEach(item => {
      amount += self.getItemTaxable(item);
    });
    return (amount);
  }
  get totalSGST() {
    const self = this;
    let amount = 0;
    self.invoiceData.items.forEach(item => {
      amount += self.getItemTaxAmt(item, 'sgst');
    });
    return (amount);
  }
  get totalCGST() {
    const self = this;
    let amount = 0;
    self.invoiceData.items.forEach(item => {
      amount += self.getItemTaxAmt(item, 'cgst');
    });
    return (amount);
  }
  get totalIGST() {
    const self = this;
    let amount = 0;
    self.invoiceData.items.forEach(item => {
      amount += self.getItemTaxAmt(item, 'igst');
    });
    return (amount);
  }

}

export interface TaxGroup {
  rate: number;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  taxableAmount: number;
  totalTax: number;
}
