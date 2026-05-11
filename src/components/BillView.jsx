import { LOGO_BASE64 } from '../utils/logoBase64'; // adjust path if needed

export const getBillHTML = (bill) => {
  const date = new Date(bill.date).toLocaleDateString('en-CA');

  const totalDiscount = bill.items.reduce((sum, i) => {
    if (i.originalPrice !== undefined && i.originalPrice !== null) {
      return sum + (i.originalPrice - i.price) * i.quantity;
    }
    return sum;
  }, 0);

  const hasAnyDiscount = totalDiscount > 0;
  const hasEditedPrice = bill.items.some(
    i => i.originalPrice !== undefined && i.originalPrice !== null
  );

  return `
  <html>
    <head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">
      <meta charset="UTF-8">
      <title>Bill ${bill.billId}</title>
      <style>
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { padding: 0; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Roboto Mono', monospace;
          width: 302px;
          margin: 0 auto;
          font-size: 12px;
          color: #111;
          background: #fff;
          font-weight: 500;
        }

        /* ── DARK HEADER ─────────────────────────────── */
        .header {
          background: #fff;
          color: #111;
          padding: 10px 8px 8px;
          text-align: center;
          border-bottom: 2px solid #1a1a1a;
        }

        .logo-wrap {
          margin-bottom: 6px;
        }

        .logo-wrap img {
          width: 225px;
          height: 225px;
          object-fit: contain;
          border-radius: 6px;
          background: #fff;
          padding: 3px; 
        }

        .shop-name {
          font-size: 17px;
          font-weight: bold;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 3px;
        }

        .tagline {
          font-size: 8.5px;
          color: #ccc;
          line-height: 1.5;
          padding: 0 4px;
        }

        .contact-bar {
          background: transparent;
          color: #000;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          padding: 4px 6px;
          letter-spacing: 0.4px;
          line-height: 1.6;
          margin-top: 4px;
        }

        /* ── BILL META ───────────────────────────────── */
        .meta-section {
          padding: 6px 8px 4px;
          border-bottom: 1px dashed #aaa;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: bold;
          padding: 1px 0;
        }

        .meta-row .label { color: #000; }
        .meta-row .value { font-weight: bold; }

        .bill-id-row {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          padding: 4px 0 2px;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #1a1a1a;
          margin: 0 8px 4px;
        }

        /* ── ITEMS TABLE ─────────────────────────────── */
        .items-wrap { padding: 0 6px; }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead tr {
          background: transparent;
          color: #000;
          border-bottom: 1px solid #000;
        }

        th {
          font-size: 14px;
          font-weight: bold;
          padding: 4px 3px;
          font-weight: bold;
          letter-spacing: 0.3px;
        }

        tbody tr:nth-child(even) { background: #f5f5f5; }

        td {
          font-size: 13px;
          font-weight: bold;
          padding: 3px 3px;
          vertical-align: top;
        }

        .right { text-align: right; }
        .center { text-align: center; }

        .variant-info {
          display: block;
          font-size: 10px;
          font-weight: bold;
          color: #000;
          font-style: italic;
        }

        .unit-label { font-size: 8.5px; color: #666; }

        .original-price {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          text-decoration: line-through;
          display: block;
        }

        .dis-price {
          font-size: 12px;
          font-weight: bold;
          color: #000;
        }

        /* ── TOTALS SECTION ──────────────────────────── */
        .totals-section {
          margin: 4px 6px 0;
          border-top: 2px solid #1a1a1a;
          padding-top: 4px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 2px;
          font-size: 15px;
          font-weight: bold;
        }

        .totals-row.grand {
          background: transparent;
          color: #000;
          padding: 4px 6px;
          margin: 4px 0;
          font-size: 15px;
          font-weight: bold;
          border-radius: 2px;
        }

        .totals-row.discount-row {
          color: #000;
          font-weight: 900;
          font-size: 17px;
        }

        /* ── FOOTER ──────────────────────────────────── */
        .dashed { border-top: 1px dashed #aaa; margin: 6px 8px; }

        .sinhala-note {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          padding: 4px 8px;
          color: #000;
          line-height: 1.6;
        }

        .thank-you {
          background: transparent;
          color: #000;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 2px;
          padding: 6px;
          margin-top: 4px;
        }
      </style>
    </head>
    <body>

      <!-- DARK HEADER -->
      <div class="header">
        <div class="logo-wrap">
          <img src="data:image/png;base64,${LOGO_BASE64}" alt="Logo" />
  
       </div>
      <!-- CONTACT BAR -->
      <div class="contact-bar">
          B/88, Badulupitiya,Badulla<br>
           Tele - 0767153333 / 0787153333
      </div>

      <!-- BILL META -->
      <div class="meta-section">
        ${bill.customerName && bill.customerName.trim()
          ? `<div class="meta-row"><span class="label">Customer</span><span class="value">${bill.customerName.trim()}</span></div>`
          : ''}
        <div class="meta-row">
          <span class="label">Date</span>
          <span class="value">${date.replace(/-/g, '.')} &nbsp; ${bill.time}</span>
        </div>
      </div>

      <div class="bill-id-row">BILL ID — ${bill.billId}</div>

      <!-- ITEMS TABLE -->
      <div class="items-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:38%;text-align:left">Item</th>
              <th style="width:10%" class="center">Qty</th>
              <th style="width:16%" class="right">Price</th>
              ${hasEditedPrice ? `<th style="width:16%" class="right">Dis.</th>` : ''}
              <th style="width:20%" class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(i => {
              const variantText = (i.variant && i.variant !== 'Standard')
                ? `<span class="variant-info">(${i.variant})</span>`
                : '';

              const unitText = (i.unit && i.unit !== 'unit')
                ? `<span class="unit-label"> ${i.unit}</span>`
                : '';

              const isPriceEdited = i.originalPrice !== undefined && i.originalPrice !== null;

              const priceCell = isPriceEdited
                ? `<span class="original-price">${parseFloat(i.originalPrice).toFixed(2)}</span>`
                : `${parseFloat(i.price).toFixed(2)}`;

              const disPriCell = hasEditedPrice
                ? (isPriceEdited
                    ? `<span class="dis-price">${parseFloat(i.price).toFixed(2)}</span>`
                    : ``)
                : '';

              return `
              <tr>
                <td>${i.name}${variantText}</td>
                <td class="center">${i.quantity}${unitText}</td>
                <td class="right">${priceCell}</td>
                ${hasEditedPrice ? `<td class="right">${disPriCell}</td>` : ''}
                <td class="right">${parseFloat(i.total).toFixed(2)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- TOTALS -->
      <div class="totals-section">
        <div class="totals-row">
          <span>Sub Total</span>
          <span>${bill.totalAmount.toFixed(2)} /=</span>
        </div>
        <div class="totals-row grand">
          <span>Cash Paid</span>
          <span>${bill.cash.toFixed(2)} /=</span>
        </div>
        <div class="totals-row">
          <span>Change</span>
          <span>${bill.change.toFixed(2)} /=</span>
        </div>
        ${hasAnyDiscount
          ? `<div class="totals-row discount-row">
               <span>Total Discount</span>
               <span>${totalDiscount.toFixed(2)} /=</span>
             </div>`
          : ''}
      </div>

      <!-- FOOTER -->
      <div class="dashed"></div>
      <div class="sinhala-note">
        Return accept within 24 hours with bill
      </div>

      <div class="thank-you">✦ THANK YOU COME AGAIN ✦</div>

      <script>
        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      </script>
    </body>
  </html>
  `;
};