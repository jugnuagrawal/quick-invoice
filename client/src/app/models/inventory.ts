export class Inventory {
  _selected: boolean;
  _id: string;
  eventId: string;
  inventoryId: string;
  name: string;
  hsn: string;
  description: string;
  category: string;
  purchasePrice: number;
  purchasePriceWithGST: number;
  price: number;
  priceWithGST: number;
  priceHasGST: boolean;
  profitMargin: number;
  discount: number;
  discountFromMRP: number;
  batchNo: string;
  sgst: number;
  cgst: number;
  igst: number;
  mrp: number;
  quantity: number;
  unit: string;
  remaining: number;
  barcode: number;
  brand: string;
  mfgDate: string;
  expDate: string;
  mfg: string;
  exp: string;
  events: Array<any>;
  status: string;
  refInventory: string;
  discountRules: Array<{ quantity: number, discount: number }>;
  [key: string]: any;

  constructor(data?: any) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = data[key];
      });
    }
  }


  calculateByProfitMargin() {
    const self = this;
    if (typeof this.profitMargin === 'string') {
      this.profitMargin = parseFloat(this.profitMargin);
    }
    // if (this.purchasePrice) {
    //   this.price = parseFloat((this.purchasePrice * (1 + (this.profitMargin / 100))).toFixed(2));
    //   self.calculatePriceWithGST();
    // } else
    if (this.purchasePriceWithGST) {
      this.priceWithGST = parseFloat((this.purchasePriceWithGST * (1 + (this.profitMargin / 100))).toFixed(2));
      self.calculatePrice();
    }
  }

  calculateMRP() {
    const self = this;
    if (typeof this.discountFromMRP === 'string') {
      this.discountFromMRP = parseFloat(this.discountFromMRP);
    }
    if (this.priceWithGST && !this.mrp) {
      this.mrp = parseFloat((this.priceWithGST / (1 - ((this.discountFromMRP) / 100))).toFixed(2));
    }
  }

  calculatePriceFromMRP() {
    const self = this;
    if (typeof this.discountFromMRP === 'string') {
      this.discountFromMRP = parseFloat(this.discountFromMRP);
    }
    if (this.mrp) {
      this.priceWithGST = parseFloat((this.mrp * (1 - (this.discountFromMRP / 100))).toFixed(2));
      self.calculatePrice();
    }
    if (this.purchasePriceWithGST && !this.profitMargin) {
      this.calculateProfit();
    }
  }

  calculatePurchasePrice() {
    const self = this;
    if (typeof this.purchasePriceWithGST === 'string') {
      this.purchasePriceWithGST = parseFloat(this.purchasePriceWithGST);
    }
    if (this.cgst && this.sgst) {
      this.purchasePrice = parseFloat((this.purchasePriceWithGST / (1 + ((this.sgst + this.cgst) / 100))).toFixed(2));
    } else if (this.igst) {
      this.purchasePrice = parseFloat((this.purchasePriceWithGST / (1 + ((this.igst) / 100))).toFixed(2));
    } else {
      this.purchasePrice = parseFloat((this.purchasePriceWithGST).toFixed(2));
    }
    if (this.profitMargin) {
      self.calculateByProfitMargin();
    }
  }

  calculatePurchasePriceWithGST() {
    const self = this;
    if (typeof this.purchasePrice === 'string') {
      this.purchasePrice = parseFloat(this.purchasePrice);
    }
    if (this.cgst && this.sgst) {
      this.purchasePriceWithGST = parseFloat(((1 + (((this.cgst || 0) + (this.sgst || 0)) / 100)) * this.purchasePrice).toFixed(2));
    } else {
      this.purchasePriceWithGST = parseFloat(((1 + (((this.igst || 0)) / 100)) * this.purchasePrice).toFixed(2));
    }
    if (this.profitMargin) {
      self.calculateByProfitMargin();
    }
  }

  calculatePrice() {
    const self = this;
    if (typeof this.priceWithGST === 'string') {
      this.priceWithGST = parseFloat(this.priceWithGST);
    }
    if (this.cgst && this.sgst) {
      this.price = parseFloat((this.priceWithGST / (1 + ((this.sgst + this.cgst) / 100))).toFixed(2));
    } else if (this.igst) {
      this.price = parseFloat((this.priceWithGST / (1 + ((this.igst) / 100))).toFixed(2));
    } else {
      this.price = parseFloat((this.priceWithGST).toFixed(2));
    }
    self.calculateDiscount();
    self.calculateProfit();
  }

  calculatePriceWithGST() {
    const self = this;
    if (typeof this.price === 'string') {
      this.price = parseFloat(this.price);
    }
    if (this.cgst && this.sgst) {
      this.priceWithGST = parseFloat(((1 + (((this.cgst || 0) + (this.sgst || 0)) / 100)) * this.price).toFixed(2));
    } else {
      this.priceWithGST = parseFloat(((1 + (((this.igst || 0)) / 100)) * this.price).toFixed(2));
    }
    self.calculateDiscount();
    self.calculateProfit();
  }

  calculateDiscount() {
    const self = this;
    if (typeof this.priceWithGST === 'string') {
      this.priceWithGST = parseFloat(this.priceWithGST);
    }
    if (typeof this.mrp === 'string') {
      this.mrp = parseFloat(this.mrp);
    }
    if ((this.mrp - this.priceWithGST) > 0) {
      this.discountFromMRP = parseFloat((((this.mrp - this.priceWithGST) / this.mrp) * 100).toFixed(2));
    } else {
      this.discountFromMRP = 0;
    }
  }

  calculateProfit() {
    // this.profitMargin = parseFloat((((this.priceWithGST - this.purchasePriceWithGST) / this.priceWithGST) * 100).toFixed(2));
    this.profitMargin = parseFloat((((this.priceWithGST - this.purchasePriceWithGST) / this.purchasePriceWithGST) * 100).toFixed(2));
  }

  addDiscountRule() {
    if (!this.discountRules) {
      this.discountRules = [];
    }
    this.discountRules.push({ discount: 0, quantity: 0 });
  }

  removeDiscountRule(index: number) {
    if (!this.discountRules) {
      this.discountRules = [];
    }
    this.discountRules.splice(index, 1);
  }
}
