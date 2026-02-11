import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import reportService from "~/services/httpServices/reportService";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
  total_price: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface KitchenOrdersSummary {
  period: string;
  total_orders: number;
  total_amount: number;
  approved_orders: number;
  pending_orders: number;
  total_items_ordered: number;
}

export default function InventoryReportPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [kitchenSummary, setKitchenSummary] = useState<KitchenOrdersSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await reportService.getKitchenReport();
      const data = (res as any)?.data?.available_stock || [];
      setInventory(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id,
              name: item.kitchen_item?.name || "",
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
              description: item.description,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }))
          : []
      );
      setKitchenSummary((res as any)?.data?.kitchen_orders_summary || null);
    } catch {
      setInventory([]);
      setKitchenSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory for rendering
  const filteredInventory = inventory.filter(item =>
    searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Report</CardTitle>
          <div className="flex gap-4 mt-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {kitchenSummary && (
            <div className="mb-6 bg-gray-50 border rounded p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Period:</span> {kitchenSummary.period}
              </div>
              <div>
                <span className="font-semibold">Total Orders:</span> {kitchenSummary.total_orders}
              </div>
              <div>
                <span className="font-semibold">Total Amount:</span> ৳{kitchenSummary.total_amount}
              </div>
              <div>
                <span className="font-semibold">Approved Orders:</span> {kitchenSummary.approved_orders}
              </div>
              <div>
                <span className="font-semibold">Pending Orders:</span> {kitchenSummary.pending_orders}
              </div>
              <div>
                <span className="font-semibold">Total Items Ordered:</span> {kitchenSummary.total_items_ordered}
              </div>
            </div>
          )}
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>৳{item.price}</TableCell>
                      <TableCell>৳{item.total_price}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}