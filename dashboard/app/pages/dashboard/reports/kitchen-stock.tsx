import { useState, useEffect } from "react";
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Package,
  Printer,
  TrendingUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { kitchenStockService } from "~/services/httpServices/kitchenStockService";
import type { KitchenStockEntry, KitchenStockSummaryItem } from "~/types/kitchenStock";
import { buildPrintDocument } from "~/lib/kitchenStockPrintDocument";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(val);

const TypeBadge = ({ type }: { type: string }) =>
  type === "KITCHEN" ? (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
      Kitchen
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
      Bar
    </span>
  );

const EntryTypeBadge = ({ entryType }: { entryType: string }) =>
  entryType === "USAGE" ? (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
      Usage
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      Purchase
    </span>
  );

export default function KitchenStockReportPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<KitchenStockSummaryItem[]>([]);
  const [entries, setEntries] = useState<KitchenStockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const generatedAt = new Date().toLocaleString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, entriesRes] = await Promise.all([
          kitchenStockService.getSummary(),
          kitchenStockService.getAll({ limit: 1000 }),
        ]);
        setSummary((summaryRes as any)?.data || []);
        setEntries((entriesRes as any)?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalItems = summary.length;
  const kitchenValue = summary
    .filter((s) => s.type === "KITCHEN")
    .reduce((acc, s) => acc + s.total_value, 0);
  const barValue = summary
    .filter((s) => s.type === "BAR")
    .reduce((acc, s) => acc + s.total_value, 0);
  const lowStockCount = summary.filter((s) => s.is_low_stock).length;

  const openPrintWindow = () => {
    const html = buildPrintDocument({
      generatedAt,
      totalItems,
      kitchenValue,
      barValue,
      lowStockCount,
      summary,
      entries,
    });
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Please allow pop-ups for this site to use Print/PDF.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <PermissionGuard permission="reports.view">
    <>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
              onClick={() => navigate("/dashboard/kitchen-stock")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stock Management
            </button>
            <h1 className="text-2xl font-bold">Kitchen Stock Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generated: {generatedAt}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openPrintWindow} disabled={loading}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={openPrintWindow}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="text-2xl font-bold">{totalItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                    <div>
                      <p className="text-xs text-gray-500">Kitchen Value</p>
                      <p className="text-lg font-bold">{formatCurrency(kitchenValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500">Bar Value</p>
                      <p className="text-lg font-bold">{formatCurrency(barValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={lowStockCount > 0 ? "border-red-200" : ""}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`w-8 h-8 ${lowStockCount > 0 ? "text-red-400" : "text-gray-300"}`}
                    />
                    <div>
                      <p className="text-xs text-gray-500">Low Stock Alerts</p>
                      <p
                        className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : ""}`}
                      >
                        {lowStockCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Summary Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Inventory Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No inventory data</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Available Qty</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((item) => (
                        <TableRow
                          key={item.kitchen_item_id}
                          className={item.is_low_stock ? "bg-red-50" : ""}
                        >
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <TypeBadge type={item.type} />
                          </TableCell>
                          <TableCell>{item.total_quantity}</TableCell>
                          <TableCell>{formatCurrency(item.total_value)}</TableCell>
                          <TableCell>{item.low_stock_threshold ?? "—"}</TableCell>
                          <TableCell>
                            {item.is_low_stock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                OK
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Stock Entries Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Stock Ledger{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({entries.length} records)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No stock entries</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Entry</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={entry.entry_type === "USAGE" ? "bg-amber-50" : ""}
                        >
                          <TableCell className="whitespace-nowrap">
                            {entry.purchase_date}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.kitchen_item?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={entry.kitchen_item?.type || ""} />
                          </TableCell>
                          <TableCell>
                            <EntryTypeBadge entryType={entry.entry_type} />
                          </TableCell>
                          <TableCell>{entry.quantity}</TableCell>
                          <TableCell>
                            {entry.entry_type === "USAGE" ? "—" : formatCurrency(entry.purchase_price)}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm max-w-[180px] truncate">
                            {entry.note || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

          </>
        )}
      </div>
    </>
    </PermissionGuard>
  );
}
