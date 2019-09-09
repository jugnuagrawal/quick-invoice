const numeral = require('numeral');
const inrInWords = require('inr-in-words');
const fecha = require('fecha');
const roundPrecision = require('round-precision');


let pages = [];
let height = 0;
let i;
let flag = 1;

function makePages(items) {
    while (flag) {
        height = 0;
        for (i = 0; i < items.length; i++) {
            const item = items[i];
            const noOfLines = Math.ceil((item.description.length / 34).toFixed(1));
            height += (noOfLines * 14);
            if (items.length > i + 1) {
                const nextItem = items[i + 1];
                const nextItemHeight = (Math.ceil((nextItem.description.length / 34).toFixed(1)) * 14);
                if (height + nextItemHeight > 460) {
                    break;
                }
            }
        }
        pages.push(items.splice(0, i));
        if (items.length == 0) {
            flag = 0;
        }
    }
}

/**
 * 
 * @param {number} percent
 * @param {string} [type]
 * @returns {number}
 */
function pm(percent, type) {
    if (!percent) {
        return 0;
    }
    if (type === '-') {
        return (1 - (percent / 100));
    } else if (type === '+') {
        return (1 + (percent / 100));
    } else {
        return (percent / 100);
    }
}

let totalTaxable = 0;
let totalSGST = 0;
let totalCGST = 0;
let totalIGST = 0;
let totalQuantity = 0;
let slNo = 0;
let taxGroups = [];
module.exports.getContent = function (data) {
    let wrapper = '';
    pages = [];
    height = 0;
    i = 0;
    flag = 1;
    totalTaxable = 0;
    totalSGST = 0;
    totalCGST = 0;
    totalIGST = 0;
    totalQuantity = 0;
    slNo = 0;
    taxGroups = [];
    makePages(data.items);
    pages.forEach((items, i) => {
        wrapper += getWrapper(data, items, i + 1, pages.length, pages.length - 1 === i);
    });
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <base href="./">
        <meta charset="utf-8">
        <meta name="author" content="Jugnu Agrawal">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Quick Invoice :: Muneem Ji</title>
        <link rel="icon" type="image/x-icon" href="favicon.ico">
    </head>
    <style>
    * {
        box-sizing: border-box;
        font-family: monospace;
    }
    @page {
        margin: 10mm 12mm;
    }
    @media print {
        .wrapper {
            margin: 0;
            height: 100%;
            width: 696px;
        }
    }

    body {
        padding: 0px;
        margin: 0px;
        font-size: 12px;
    }

    .font-10 {
        font-size: 10px;
    }

    .font-bold {
        font-weight: bold;
    }

    .text-left {
        text-align: left;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .text-capitalize {
        text-transform: capitalize;
    }

    .float-right {
        float: right;
    }

    .padding {
        padding: 0px 3px;
    }

    .h-100 {
        height: 100%;
    }

    .d-flex {
        display: flex;
    }

    .flex-column {
        flex-direction: column;
    }

    .align-items-center {
        align-items: center;
    }

    .align-items-start {
        align-items: flex-start;
    }

    .align-items-end {
        align-items: flex-end;
    }

    .justify-content-center {
        justify-content: center;
    }

    .justify-content-start {
        justify-content: flex-start;
    }

    .justify-content-end {
        justify-content: flex-end;
    }

    .stretch-height {
        flex-grow: 1;
    }

    .bb-0 {
        border-bottom: 0 !important;
    }

    .bt-1 {
        border-top: 1px solid #000;
    }

    .fake-row strong,
    .fake-row label {
        min-width: 100px;
        display: inline-block;
    }

    .fake-col {
        display: inline-block;
        margin-right: 16px;
    }

    .wrapper {
        max-height: 1032px;
        width: 696px;
        /* height: 273.05mm; */
        /* width: 184.15mm; */
        overflow: hidden;
        page-break-after: always;
        border: 1px solid #000;
        border-bottom: 0px;
    }

    .row {
        border-bottom: 1px solid #000;
        display: flex;
    }

    .top-bar {
        justify-content: center;
        height: 16px;
    }

    .shop-info,
    .customer-info,
    .summary-info {
        height: 100px;
    }

    .declare-info {
        height: 68px;
    }

    .separator.row {
        height: 16px;
    }

    .items-table {
        display: flex;
        flex-direction: column;
        font-size: 12px;
        border-bottom: 1px solid #000;
        /* max-height 588px */
        height: 480px;
    }

    .items-table .items-row {
        display: flex;
    }

    .items-table .items-row:last-child {
        flex-grow: 1;
    }

    .items-table .items-row.font-bold {
        font-size: 10px;
        border-bottom: 1px solid #000;
        height: 26px;
    }

    .items-table .items-row div {
        padding: 0px 3px;
    }

    .shop-info.row>div:not(:last-child),
    .customer-info.row>div:not(:last-child),
    .separator.row>div:not(:last-child),
    .summary-info.row>div:not(:last-child),
    .declare-info.row>div:not(:last-child),
    .items-table .items-row>div:not(:last-child) {
        border-right: 1px solid #000;
    }

    .w-50 {
        width: 347px;
    }

    .w-slno {
        width: 28px;
    }

    .w-desc {
        width: 253px;
    }

    .w-hsn {
        width: 66px;
    }

    .w-qty {
        width: 32px;
    }

    .w-price {
        width: 72px;
    }

    .w-disc {
        width: 36px;
    }

    .w-sgst {
        width: 43px;
    }

    .w-cgst {
        width: 43px;
    }

    .w-igst {
        width: 43px;
    }

    .w-total {
        width: 78px;
    }

    .w-all-total {
        width: 315px;
    }

    .w-rate {
        width: 43px;
    }

    .w-taxable {
        width: 82px;
    }

    .w-sgst-amt {
        width: 70px;
    }

    .w-cgst-amt {
        width: 70px;
    }

    .w-igst-amt {
        width: 70px;
    }

    .w-total-amt {
        width: 78px;
    }

    .w-note{
        width: 281px;
    }

    .w-eoe {
        width: 174px;
    }

    .w-page {
        width: 173px;
    }
    </style>
    
    <body>
        ${wrapper}
    </body>
    
    </html>`
}


function getWrapper(data, items, currentPage, totalPage, withEnd) {
    return `
    <div class="wrapper">
        ${getTop(data)}
        ${getCenter(items)}
        ${getBottom(data, currentPage, totalPage, withEnd)}
    </div>
    `;
}

function getTop(data) {
    const invoiceDate = data.invoiceDate || new Date().getTime();
    const dueDate = data.dueDate ? fecha.format(new Date(data.dueDate), 'dd-MMM-YYYY') : '';
    return `<div class="top-bar row">
    <div class="text-center font-bold">Tax Invoice</div>
</div>
<div class="shop-info row">
    <div class="w-50">
        <div class="padding">
            <div class="fake-row">
                <strong>${data.firm.name || ''}</strong>
            </div>
            <div class="fake-row">
                ${data.firm.address || ''}
            </div>
            <div class="fake-row">
                PAN : ${data.firm.pan || ''}
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    GSTN : ${data.firm.gstn || ''}
                </div>
                <div class="fake-col">
                    State Code : ${data.firm.code || ''}
                </div>
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    Contact No : ${data.firm.contactNo || ''}
                </div>
                <div class="fake-col">
                    Email ID : ${data.firm.email || ''}
                </div>
            </div>
        </div>
    </div>
    <div class="w-50">
        <div class="padding">
            <div class="fake-row">
                <strong>Invoice No.</strong>
                <span>: ${data.invoiceId}</span>
            </div>
            <div class="fake-row">
                <strong>Date</strong>
                <span>: ${fecha.format(new Date(invoiceDate), 'dd-MMM-YYYY')}</span>
            </div>
            <div class="fake-row">
                <strong>Payment Type</strong>
                <span>: ${data.paymentType || ''}</span>
            </div>
            <div class="fake-row">
                <strong>Due Date</strong>
                <span>: ${dueDate}</span>
            </div>
        </div>
    </div>
</div>
<div class="separator row">
    <div class="w-50 padding">
        <strong>Details of Receiver (Billed to)</strong>
    </div>
    <div class="w-50 padding">
        <strong>Details of Consignee (Shipped to)</strong>
    </div>
</div>
<div class="customer-info row">
    <div class="w-50">
        <div class="padding">
            <div class="fake-row">
                <strong>${data.billTo.name || ''}</strong>
            </div>
            <div class="fake-row">
                ${data.billTo.address || ''}
            </div>
            <div class="fake-row">
                PAN : ${data.billTo.pan || ''}
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    GSTN : ${data.billTo.gstn || ''}
                </div>
                <div class="fake-col">
                    State Code : ${data.billTo.code || ''}
                </div>
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    Contact No : ${data.billTo.contactNo || ''}
                </div>
                <div class="fake-col">
                    Email ID : ${data.billTo.email || ''}
                </div>
            </div>
        </div>
    </div>
    <div class="w-50">
        <div class="padding">
            <div class="fake-row">
                <strong>${data.shipTo.name || ''}</strong>
            </div>
            <div class="fake-row">
                ${data.shipTo.address || ''}
            </div>
            <div class="fake-row">
                PAN : ${data.shipTo.pan || ''}
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    GSTN : ${data.shipTo.gstn || ''}
                </div>
                <div class="fake-col">
                    State Code : ${data.shipTo.code || ''}
                </div>
            </div>
            <div class="fake-row">
                <div class="fake-col">
                    Contact No : ${data.shipTo.contactNo || ''}
                </div>
                <div class="fake-col">
                    Email ID : ${data.shipTo.email || ''}
                </div>
            </div>
        </div>
    </div>
</div>`;
}

function getCenter(items) {
    return `
    <div class="items-table">
    <div class="items-row font-bold">
        <div class="w-slno text-center">S. No.</div>
        <div class="w-desc text-center">Description</div>
        <div class="w-hsn text-center">HSN</div>
        <div class="w-qty text-center">Qty.</div>
        <div class="w-price text-center">Price (Rs.)</div>
        <div class="w-disc text-center">Disc. %</div>
        <div class="w-sgst text-center">SGST %</div>
        <div class="w-cgst text-center">CGST %</div>
        <div class="w-igst text-center">IGST %</div>
        <div class="w-total text-center">Total (Rs.)</div>
    </div>
    ${getRows(items)}
    </div>`;
}

function getRows(items) {
    let rows = '';
    items.forEach((item, i) => {
        item.igst = item.igst || 0;
        if (item.igst) {
            item.sgst = item.igst / 2;
            item.cgst = item.igst / 2;
        } else {
            item.sgst = item.sgst || 0;
            item.cgst = item.cgst || 0;
        }
        item.discount = item.discount || 0;
        slNo++;
        const taxableAmount = parseFloat(((item.price * (pm(item.discount, '-') || 1)) * item.quantity));
        const sgstAmount = parseFloat((taxableAmount * pm(item.sgst)));
        const cgstAmount = parseFloat((taxableAmount * pm(item.cgst)));
        const igstAmount = parseFloat((taxableAmount * pm(item.igst)));
        const total = taxableAmount + sgstAmount + cgstAmount + igstAmount;
        totalTaxable += taxableAmount;
        totalSGST += sgstAmount;
        totalCGST += cgstAmount;
        totalIGST += igstAmount;
        totalQuantity += parseInt(item.quantity, 10);
        // TAX Grouping Start
        let taxIndex = -1;
        let taxGroup = {
            sgst: item.sgst,
            cgst: item.cgst,
            igst: item.igst,
            sgstAmount: 0,
            cgstAmount: 0,
            igstAmount: 0,
            taxableAmount: 0,
            totalAmount: 0
        };
        if (taxGroups && taxGroups.length > 0) {
            taxIndex = taxGroups.findIndex(e => e.sgst === item.sgst);
        }
        if (taxIndex > -1) {
            taxGroup = taxGroups[taxIndex];
            taxGroups.splice(taxIndex, 1);
        }
        taxGroup.sgstAmount += sgstAmount;
        taxGroup.cgstAmount += cgstAmount;
        taxGroup.igstAmount += igstAmount;
        taxGroup.taxableAmount += taxableAmount;
        taxGroup.totalAmount += total;
        taxGroups.push(taxGroup);
        // TAX Groupung End
        rows += `
        <div class="items-row">
            <div class="text-right w-slno">${slNo}</div>
            <div class="w-desc">
                ${item.description}
            </div>
            <div class="text-right w-hsn">${item.hsn}</div>
            <div class="text-right w-qty">${item.quantity}</div>
            <div class="text-right w-price">${formatNumber((item.price))}</div>
            <div class="text-right w-disc">${item.discount}</div>
            <div class="text-right w-sgst">${item.sgst}</div>
            <div class="text-right w-cgst">${item.cgst}</div>
            <div class="text-right w-igst">${item.igst}</div>
            <div class="text-right w-total">${formatNumber((total))}</div>
        </div>`;
    });
    return rows;
}

function getBottom(data, currentPage, totalPage, withEnd) {
    return `<div class="separator row">
        <div class="w-50 padding">
            
        </div>
        <div class="w-qty padding text-right">
            <strong>${totalQuantity}</strong>
        </div>
        <div class="w-all-total padding text-right">
            <strong>${formatNumber((totalTaxable + totalSGST + totalCGST + totalIGST))}</strong>
        </div>
    </div>
    <div class="summary-info row">
        <div class="w-note">
            <div class="padding">
                <strong>Note:&nbsp;</strong><br>
                ${(data.note || '')}
            </div>
        </div>
        <div class="d-flex flex-column" ${hideCell(withEnd)}>
            <div class="separator row font-10">
                <div class="padding text-center w-rate">
                    <strong>Rate</strong>
                </div>
                <div class="padding text-center w-taxable">
                    <strong>Taxable Amt.</strong>
                </div>
                <div class="padding text-center w-sgst-amt">
                    <strong>SGST Amt.</strong>
                </div>
                <div class="padding text-center w-cgst-amt">
                    <strong>CGST Amt.</strong>
                </div>
                <div class="padding text-center w-igst-amt">
                    <strong>IGST Amt.</strong>
                </div>
                <div class="padding text-center w-total-amt">
                    <strong>Total Tax</strong>
                </div>
            </div>
            ${getTaxRows()}
            <div class="separator row bb-0 stretch-height">
                <div class="padding text-right w-rate font-10">
                    <strong>Total</strong>
                </div>
                <div class="padding text-right w-taxable">${formatNumber((totalTaxable))}</div>
                <div class="padding text-right w-sgst-amt">${formatNumber((totalSGST))}</div>
                <div class="padding text-right w-cgst-amt">${formatNumber((totalCGST))}</div>
                <div class="padding text-right w-igst-amt">${formatNumber((totalIGST))}</div>
                <div class="padding text-right w-total-amt">
                    <b>${formatNumber((totalSGST + totalCGST + totalIGST))}</b>
                </div>
            </div>
        </div>
    </div>
    <div class="declare-info row">
        <div class="w-50">
            <div class="padding" ${hideCell(withEnd)}>
                <strong>Total Amount In Words</strong><br>
                <div class="text-capitalize">
                    ${inrInWords.convert(roundPrecision(totalTaxable + totalSGST + totalCGST + totalIGST, 2))}
                </div>
            </div>
        </div>
        <div class="w-50">
            <div class="" ${hideCell(withEnd)}>
                ${getExtraRows(data.extras)}
            </div>
        </div>
    </div>
    <div class="declare-info row">
        <div class="w-50">
            <div class="padding" ${hideCell(withEnd)}>
                <u>Declaration</u><br>
                <div>We Declare that this invoice shows the actual price of the goods described and that all
                    particulars are true &amp; correct.
                </div>
            </div>
        </div>
        <div class="w-50">
            <div class="padding d-flex flex-column align-items-center justify-content-end h-100" ${hideCell(withEnd)}>
                <div class="text-center">
                    <strong>${data.firm.name}</strong>
                    <div>Authorised Signatory</div>
                </div>
            </div>
        </div>
    </div>
    <div class="separator row">
        <div class="w-50 padding text-center">
            This is a computer generated invoice
        </div>
        <div class="w-eoe padding text-center">
            E. &amp; OE.
        </div>
        <div class="w-page padding text-right">
            Page ${currentPage} of ${totalPage}
        </div>
    </div>`;
}

function getTaxRows() {
    let taxRows = '';
    taxGroups.forEach(group => {
        const totalTax = roundPrecision(group.sgstAmount, 2) + roundPrecision(group.cgstAmount, 2) + roundPrecision(group.igstAmount, 2);
        taxRows += `<div class="separator row">
            <div class="padding text-right w-rate">${group.sgst}</div>
            <div class="padding text-right w-taxable">${formatNumber((group.taxableAmount))}</div>
            <div class="padding text-right w-sgst-amt">${formatNumber((group.sgstAmount))}</div>
            <div class="padding text-right w-cgst-amt">${formatNumber((group.cgstAmount))}</div>
            <div class="padding text-right w-igst-amt">${formatNumber((group.igstAmount))}</div>
            <div class="padding text-right w-total-amt">${formatNumber((totalTax))}</div>
        </div>`;
    });
    return taxRows;
}

function getExtraRows(extras) {
    let extraRows = '';
    let extraValue = 0;
    extras.forEach((extra, i) => {
        const value = getExtraValue(extra);
        extraValue += value;
        extraRows += `<div class="fake-row padding">
            <div class="fake-col">
                ${extra.label}
            </div>
            <div class="float-right">
                ${formatNumber((value))}
            </div>
        </div>`;
    });
    extraRows += `<div class="fake-row padding ${extras.length > 0?'bt-1':''}">
            <div class="fake-col">
                <strong>Total</strong>
            </div>
            <div class="float-right">
                <b>${formatNumber((totalTaxable + totalSGST + totalCGST + totalIGST + extraValue))}</b>
            </div>
        </div>`;
    return extraRows;
}


function getExtraValue(data) {
    const totalAmount = (totalTaxable + totalCGST + totalSGST + totalIGST) || 0;
    let amount = 0;
    try {
        if (data.type && data.type === 'PERCENT') {
            amount = (parseFloat((totalAmount * parseFloat(data.value)) / 100));
        } else {
            amount = parseFloat(data.value);
        }
    } catch (e) {
        amount = 0;
    }
    return amount;
}

function formatNumber(value) {
    return numeral(value).format('0.00');
}

function hideCell(withEnd) {
    if (!withEnd) {
        return 'style="visibility:hidden"';
    }
    return '';
}