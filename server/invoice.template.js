const inrInWords = require('inr-in-words');
const moment = require('moment');
const jsbarcode = require('jsbarcode');
const { createCanvas } = require('canvas');


let taxGroup = [
    { class: 0, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
    { class: 5, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
    { class: 12, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
    { class: 18, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
    { class: 28, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 }
];

let totalQuantity = 0;
let totalAmount = 0;
/**
 * 
 * @param {[[{HSN:number,Description:string,Price:number,Quantity:number,Discount:number,SGST:number,CGST:nunber}]]} pages 
 */
function getContent(payload) {
    totalQuantity = 0;
    totalAmount = 0;
    taxGroup = [
        { class: 0, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
        { class: 5, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
        { class: 12, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
        { class: 18, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 },
        { class: 28, taxable: 0, sgstAmount: 0, cgstAmount: 0, totalGST: 0 }
    ];
    const layout = payload.layout;
    console.log('TEMPLATE', layout);
    if (!payload.columns) {
        payload.columns = [];
    }
    payload.columns = payload.columns.filter(e => e.show);
    if (payload.columns.length === 0) {
        payload.columns.push({ key: 'priceWithGST', label: 'Price', show: true });
    }
    enrichData(payload.items);
    calculateTaxGroup(payload.items);
    const wrapper = getWrapper(payload);
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf8">
        <meta name="author" content="Jugnu Agrawal">
        <title>DD Enterprises</title>
    </head>
    <style>
        * {
            box-sizing: border-box;
            font-family: monospace;
        }

        body {
            padding: 0px;
            margin: 0px;
            font-size: 11px;
        }
        
        ${layoutCSS(layout)}

        @media print {
            html, body {
                width: unset;
                height: unset;
            }
        }
        
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .text-left {
            text-align: left;
        }

        .font-13 {
            font-size: 13px;
        }

        .item-row td {
            padding:0px 3px;
        }

        table.report-container {
            page-break-after: always;
            border-collapse: collapse;
        }

        .w-50 {
            width: 50%;
        }
        .w-100 {
            width: 100%;
        }
    </style>
    
    <body>
        ${wrapper}
    </body>
    
    </html>`
}

function layoutCSS(layout) {
    if (layout === 'landscape') {
        return `html, body {
            width: 297mm;
            height: 210mm;
        }
        @page {
            size: A4 landscape;
            margin: 12mm;
        }`;
    } else {
        return `html, body {
            width: 210mm;
            height: 297mm;
        }
        @page {
            size: A4 portrait;
            margin: 12mm;
        }`;
    }
}


function getWrapper(payload) {
    return `
    <table border="1" class="report-container">
        <thead class="report-header">
            ${getTop(payload)}
        </thead>
        <tbody class="report-content">
            ${getCenter(payload)}
        </tbody>
        <tfoot>
            ${getBottom(payload)}
        </tfoot>
    </table>
    `;
}

function getTop(payload) {
    const columns = payload.columns;
    const colspan = columns.length + 4;
    return `<tr>
    <th class="text-center" colspan="${colspan}">Tax Invoice</th>
</tr>
<tr>
    <td colspan="${colspan}">
        <table style="width:calc(100% + 4px);border-collapse: collapse; margin:-2px" cellpadding="3" border>
            <tr>
                <td class="text-left">
                    <strong>Invoice ID :</strong>
                    <span>${(payload._id || '')}</span>
                </td>
                <td class="text-left">
                    <strong>Invoice Date :</strong>
                    <span>${moment(payload.invoiceDate).format('DD-MM-YYYY')}</span>
                </td>
            </tr>
            <tr>
                <td class="w-50">
                    <div class="details-cell">
                        <div class="fake-row">
                            <strong>${payload.firm.name || ''}</strong>
                        </div>
                        <div class="fake-row">${payload.firm.address.split('\n').join('<br>') || ''}</div>
                        <div class="fake-row">
                            <span class="fake-col w-50">
                                GSTN :  ${payload.firm.gstn || '-'}
                            </span>
                            <span class="fake-col w-50">
                                State Code : ${payload.firm.stateCode || '-'}
                            </span>
                        </div>
                        <div class="fake-row">
                            <span class="fake-col w-50">
                                Contact No :  ${payload.firm.contactNo || '-'}
                            </span>
                            <span class="fake-col  w-50">
                                Email : ${payload.firm.email || '-'}
                            </span>
                        </div>
                    </div>
                </td>
                <td class="w-50">
                    <div class="details-cell">
                        <div class="fake-row">
                            <strong>${payload.customer.name || ''}</strong>
                        </div>
                        <div class="fake-row">${payload.customer.address.split('\n').join('<br>') || ''}</div>
                        <div class="fake-row">
                            <span class="fake-col w-50">
                                GSTN :  ${payload.customer.gstn || '-'}
                            </span>
                            <span class="fake-col w-50">
                                State Code : ${payload.customer.stateCode || '-'}
                            </span>
                        </div>
                        <div class="fake-row">
                            <span class="fake-col w-50">
                                Contact No :  ${payload.customer.contactNo || '-'}
                            </span>
                            <span class="fake-col w-50">
                                Email : ${payload.customer.email || '-'}
                            </span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr class="">
    <th class="text-right">SNo</th>
    ${ showColumn(columns, 'hsn') ? `<th class="">HSN</th>` : ''}
    <th class="w-100">Description</th>
    <th class="text-right">Qty</th>
    ${ showColumn(columns, 'unit') ? `<th class="text-center">Unit</th>` : ''}
    ${ showColumn(columns, 'mfg') ? `<th class="text-center">Manufacturer</th>` : ''}
    ${ showColumn(columns, 'mfgDate') ? `<th class="text-center">Mfg.</th>` : ''}
    ${ showColumn(columns, 'exp') ? `<th class="text-center">Exp.</th>` : ''}
    ${ showColumn(columns, 'batch') ? `<th class="text-center">Batch</th>` : ''}
    ${ showColumn(columns, 'mrp') ? `<th class="text-center">MRP</th>` : ''}
    ${ showColumn(columns, 'price') ? `<th class="text-right">Price</th>` : ''}
    ${ showColumn(columns, 'priceWithGST') ? `<th class="text-right">Price</th>` : ''}
    ${ showColumn(columns, 'discount') ? `<th class="text-right">Disc.</th>` : ''}
    ${ showColumn(columns, 'taxable') ? `<th class="text-right">Taxable</th>` : ''}
    ${ showColumn(columns, 'sgst') ? `<th class="text-right">SGST %</th>` : ''}
    ${ showColumn(columns, 'sgstAmount') ? `<th class="text-right">SGST Amt</th>` : ''}
    ${ showColumn(columns, 'cgst') ? `<th class="text-right">CGST %</th>` : ''}
    ${ showColumn(columns, 'cgstAmount') ? `<th class="text-right">CGST Amt</th>` : ''}
    ${ showColumn(columns, 'igst') ? `<th class="text-right">IGST %</th>` : ''}
    ${ showColumn(columns, 'igstAmount') ? `<th class="text-right">IGST Amt</th>` : ''}
    <th class="text-right">Total</th>
</tr>
`;
}

function getCenter(payload) {
    const columns = payload.columns;
    const colspan = columns.length + 4;
    return `${getRows(payload)}
    <tr>
        <td class="text-right font-13" colspan="${colspan}">
            <span style="margin-right:5px">Total Quantity :</span>
            <strong style="margin-right:100px">${totalQuantity}</strong>
            <span style="margin-right:5px">Total Amount :</span>
            <strong>&#8377;&nbsp;${getRupeesFormat(totalAmount)}</strong>
        </td>
    </tr>
    <tr>
        <td colspan="${colspan}">
            <table style="width:calc(100% + 4px);border-collapse: collapse; margin:-2px" cellpadding="3" border>
                <tr>
                    <td class="text-left w-50" valign="top">
                        <div class="summary-cell">
                            <b>Total Amount In Words</b><br>
                            <div style="text-transform: capitalize;">
                                ${inrInWords.convert(parseFloat((totalAmount).toFixed(2)))} Only
                            </div>
                        </div>
                    </td>
                    <td class="w-50" valign="top">
                        <table style="width:calc(100% + 8px);border-collapse: collapse; margin:-4px" border>
                            <tr>
                                <th class="text-right">Tax %</th>
                                <th class="text-right">Taxable</th>
                                <th class="text-right">SGST Amt.</th>
                                <th class="text-right">CGST Amt.</th>
                                <th class="text-right">Total Tax</th>
                            </tr>
                            ${getTaxRows()}
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>`;
}

function getRows(payload) {
    let rows = '';
    const columns = payload.columns;
    const items = payload.items;
    items.forEach((item, i) => {
        const last = (items.length - 1) == i;
        totalAmount += item.total;
        totalQuantity += item.quantity;
        rows += `
    <tr class="item-row" ${last ? '' : 'style="border-bottom:1px solid transparent;"'}>
        <td class="text-right">${item.sn}</td>
        ${ showColumn(columns, 'hsn') ? `<td class="text-right">${item.hsn}</td>` : ''}
        <td class="w-100">${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        ${ showColumn(columns, 'unit') ? `<td class="text-center">${(item.unit || '-')}</td>` : ''}
        ${ showColumn(columns, 'mfg') ? `<td class="text-center">${(item.mfg || '-')}</td>` : ''}
        ${ showColumn(columns, 'mfgDate') ? `<td class="text-center">${(item.mfgDate || '-')}</td>` : ''}
        ${ showColumn(columns, 'exp') ? `<td class="text-center">${(item.exp || '-')}</td>` : ''}
        ${ showColumn(columns, 'batch') ? `<td class="text-center">${item.batch}</td>` : ''}
        ${ showColumn(columns, 'mrp') ? `<td class="text-right">${(item.mrp || 0).toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'price') ? `<td class="text-right">${(item.price || 0).toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'priceWithGST') ? `<td class="text-right">${(item.priceWithGST || 0).toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'discount') ? `<td class="text-right">${(item.discount || 0)}%</td>` : ''}
        ${ showColumn(columns, 'taxable') ? `<td class="text-right">${item.taxable.toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'sgst') ? `<td class="text-right">${item.sgst}%</td>` : ''}
        ${ showColumn(columns, 'sgstAmount') ? `<td class="text-right">${item.sgstAmount.toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'cgst') ? `<td class="text-right">${item.cgst}%</td>` : ''}
        ${ showColumn(columns, 'cgstAmount') ? `<td class="text-right">${item.cgstAmount.toFixed(2)}</td>` : ''}
        ${ showColumn(columns, 'igst') ? `<td class="text-right">${item.igst}%</td>` : ''}
        ${ showColumn(columns, 'igstAmount') ? `<td class="text-right">${item.igstAmount.toFixed(2)}</td>` : ''}
        <td class="text-right">${(item.total).toFixed(2)}</td>
    </tr>`;
    });
    return rows;
}

function getBottom(payload) {
    const columns = payload.columns;
    const colspan = columns.length + 4;
    let barcodeData;
    if (payload._id) {
        const canvas = createCanvas(144, 72);
        jsbarcode(canvas, payload._id, { displayValue: false });
        barcodeData = canvas.toDataURL();
    }
    return `
    <tr>
        <td colspan="${colspan}">
            <table style="width:calc(100% + 4px);border-collapse: collapse; margin:-2px" cellpadding="3" border>
                <tr>
                    <td colspan="2" class="text-left w-50" valign="top">
                        <div class="declare-cell">
                            <u>Declaration</u><br>
                            <div>We Declare that this invoice shows the actual price of the goods described andthat all
                                particulars are true & correct.
                            </div>
                        </div>
                    </td>
                    <td class="text-center w-50" valign="bottom">
                        <div class="declare-cell">
                            <strong>${payload.firm.name}</strong>
                            <div>Authorised Signatory</div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="text-left">
                    ${barcodeData ? `<img style="margin: -3px;width: 140px;margin-bottom: -6px;" src="${barcodeData}"/>` : ''}
                    </td>
                    <td class="text-center">E. & OE.</td>
                    <td class="text-center w-50">
                        <span>This is a computer generated invoice</span>
                        ${payload.jurisdiction ? `<br><span>Subject to ${payload.jurisdiction} Jurisdiction</span>` : ''}
                    </td>
                </tr>
            </table>
        </td>
    </tr>`;
}

function getTaxRows() {
    let rows = '';
    taxGroup.forEach(tax => {
        rows += `<tr>
        <td class="text-right">${tax.class} %</td>
        <td class="text-right">${(tax.taxable).toFixed(2)}</td>
        <td class="text-right">${(tax.sgstAmount).toFixed(2)}</td>
        <td class="text-right">${(tax.sgstAmount).toFixed(2)}</td>
        <td class="text-right">${(tax.totalGST).toFixed(2)}</td>
    </tr>`
    });
    return rows;
}


/**
 * 
 * @param {Array<any>} records 
 */
function enrichData(records) {
    records.forEach((row, i) => {
        try {
            if (typeof row.sgst !== 'number') {
                row.sgst = parseFloat(row.sgst);
            }
        } catch (e) {
            row.sgst = 0;
        }
        try {
            if (typeof row.igst !== 'number') {
                row.igst = parseFloat(row.igst);
            }
        } catch (e) {
            row.igst = 0;
        }
        try {
            if (typeof row.cgst !== 'number') {
                row.cgst = parseFloat(row.cgst);
            }
        } catch (e) {
            row.cgst = 0;
        }
        try {
            if (typeof row.price !== 'number') {
                row.price = parseFloat(row.price);
            }
        } catch (e) {
            row.price = 0;
        }
        try {
            if (typeof row.discount !== 'number') {
                row.discount = parseFloat(row.discount);
            }
        } catch (e) {
            row.discount = 0;
        }
        row.sn = i + 1;
        if (row.exp) {
            row.exp = moment(new Date(row.exp)).format('MM/YY');
        }
        if (row.mfgDate) {
            row.mfgDate = moment(new Date(row.mfgDate)).format('MM/YY');
        }
        row.taxable = (row.quantity * row.price) * (1 - (row.discount / 100));
        row.sgstAmount = row.taxable * (row.sgst / 100);
        row.cgstAmount = row.taxable * (row.cgst / 100);
        row.igstAmount = row.taxable * (row.igst / 100);
        row.total = row.taxable + row.sgstAmount + row.cgstAmount + row.igstAmount;
    });
}

/**
 * 
 * @param {Array<any>} records 
 */
function calculateTaxGroup(records) {
    records.forEach(row => {
        const gst = Math.floor((row.sgst + row.cgst));
        const index = taxGroup.findIndex(e => e.class == gst);
        const temp = taxGroup[index];
        temp.class = gst;
        temp.taxable += row.taxable;
        temp.total += row.total;
        temp.sgstAmount += row.sgstAmount;
        temp.cgstAmount += row.cgstAmount;
        temp.igstAmount += row.igstAmount;
        temp.totalGST += row.sgstAmount + row.cgstAmount
        taxGroup.splice(index, 1, temp);
    });
}

/**
 * 
 * @param {Array<any>} columns
 * @param {string} key 
 */
function showColumn(columns, key) {
    const temp = columns.find(e => e.key === key);
    if (temp) {
        return true;
    }
    return false;
}

/**
 * 
 * @param {number} amount 
 */
function getRupeesFormat(amount) {
    const decimal = amount.toFixed(2).split('.')[0];
    let fraction = amount.toFixed(2).split('.')[1];
    if (!fraction) {
        fraction = '00'
    }
    let digits = decimal.split('');
    if (digits.length > 7) {
        digits.splice(digits.length - 3, 0, ',');
        digits.splice(digits.length - 6, 0, ',');
        digits.splice(digits.length - 9, 0, ',');
    } else if (digits.length > 5) {
        digits.splice(digits.length - 3, 0, ',');
        digits.splice(digits.length - 6, 0, ',');
    } else if (digits.length > 3) {
        digits.splice(digits.length - 3, 0, ',');
    }
    return digits.join('') + '.' + fraction;
}

module.exports.getContent = getContent;