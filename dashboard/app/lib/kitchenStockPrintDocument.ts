import type { KitchenStockEntry, KitchenStockSummaryItem } from "~/types/kitchenStock";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface PrintDocumentData {
  generatedAt: string;
  totalItems: number;
  kitchenValue: number;
  barValue: number;
  lowStockCount: number;
  summary: KitchenStockSummaryItem[];
  entries: KitchenStockEntry[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(val);

function typeBadgeHtml(type: string): string {
  const isKitchen = type === "KITCHEN";
  const bg = isKitchen ? "#ffedd5" : "#dbeafe";
  const color = isKitchen ? "#c2410c" : "#1d4ed8";
  const label = isKitchen ? "Kitchen" : "Bar";
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:${bg};color:${color}">${label}</span>`;
}

function statusBadgeHtml(isLow: boolean): string {
  if (isLow) {
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#fee2e2;color:#b91c1c">&#9888; Low Stock</span>`;
  }
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#dcfce7;color:#15803d">OK</span>`;
}

function summaryRows(summary: KitchenStockSummaryItem[]): string {
  if (summary.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:20px">No inventory data</td></tr>`;
  }
  return summary
    .map(
      (item) => `
    <tr style="${item.is_low_stock ? "background:#fef2f2" : ""}">
      <td style="padding:7px 10px;border:1px solid #e5e7eb;font-weight:500">${esc(item.name)}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${typeBadgeHtml(item.type)}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${item.total_quantity}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${fmt(item.total_value)}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${item.low_stock_threshold ?? "—"}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${statusBadgeHtml(item.is_low_stock)}</td>
    </tr>`
    )
    .join("");
}

function entryRows(entries: KitchenStockEntry[]): string {
  if (entries.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:20px">No stock entries</td></tr>`;
  }
  return entries
    .map(
      (entry) => `
    <tr>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;white-space:nowrap">${esc(entry.purchase_date)}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;font-weight:500">${entry.kitchen_item ? esc(entry.kitchen_item.name) : "—"}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${typeBadgeHtml(entry.kitchen_item?.type || "")}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${entry.quantity}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">${fmt(entry.purchase_price)}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;color:#6b7280">${entry.note ? esc(entry.note) : "—"}</td>
    </tr>`
    )
    .join("");
}

export function buildPrintDocument(data: PrintDocumentData): string {
  const { generatedAt, totalItems, kitchenValue, barValue, lowStockCount, summary, entries } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kitchen Stock Report — CoffeeClub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 32px 16px;
      border-bottom: 2px solid #1a1a1a;
      margin-bottom: 20px;
    }
    .brand-name { font-size: 22px; font-weight: 700; letter-spacing: 0.04em; }
    .brand-sub { font-size: 11px; color: #6b7280; margin-top: 3px; }
    .report-meta { text-align: right; }
    .report-title { font-size: 15px; font-weight: 600; }
    .report-date { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 0 32px 24px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .stat-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .stat-value.danger { color: #dc2626; }
    .stat-value.currency { font-size: 15px; }
    .section { padding: 0 32px 24px; }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section-count { font-size: 11px; font-weight: 400; color: #6b7280; margin-left: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th {
      background: #f9fafb;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      border: 1px solid #e5e7eb;
    }
    .page-break { page-break-before: always; padding-top: 24px; }
    .print-footer {
      padding: 16px 32px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      margin-top: 20px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="report-header">
    <div>
      <div class="brand-name">CoffeeClub</div>
      <div class="brand-sub">Restaurant Management System</div>
    </div>
    <div class="report-meta">
      <div class="report-title">Kitchen Stock Report</div>
      <div class="report-date">Generated: ${esc(generatedAt)}</div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Items</div>
      <div class="stat-value">${totalItems}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Kitchen Value</div>
      <div class="stat-value currency">${fmt(kitchenValue)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Bar Value</div>
      <div class="stat-value currency">${fmt(barValue)}</div>
    </div>
    <div class="stat-card" style="${lowStockCount > 0 ? "border-color:#fca5a5" : ""}">
      <div class="stat-label">Low Stock Alerts</div>
      <div class="stat-value${lowStockCount > 0 ? " danger" : ""}">${lowStockCount}</div>
    </div>
  </div>

  <!-- Inventory Summary Table -->
  <div class="section">
    <div class="section-title">Inventory Summary</div>
    <table>
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Type</th>
          <th>Total Qty</th>
          <th>Total Value</th>
          <th>Threshold</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${summaryRows(summary)}
      </tbody>
    </table>
  </div>

  <!-- Stock Entries Table (new page) -->
  <div class="page-break">
    <div class="section">
      <div class="section-title">
        Stock Entries
        <span class="section-count">(${entries.length} records)</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Item Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${entryRows(entries)}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div class="print-footer">
    CoffeeClub &mdash; Kitchen Stock Report &mdash; ${esc(generatedAt)}
  </div>

  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;
}
