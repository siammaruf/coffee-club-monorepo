import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { kitchenOrderService } from "~/services/httpServices/kitchenOrderService";

export default function KitchenOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      if (!id) {
        setOrder(null);
        setLoading(false);
        return;
      }
      const res = await kitchenOrderService.getById(id);
      setOrder((res as any).data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
        <span className="ml-4 text-gray-500 text-lg">Loading...</span>
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center text-red-600">Order not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            Kitchen Order Details
            {order.is_approved ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                Approved
                </span>
            ) : (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Pending
                </span>
            )}
            </h1>
            <span className="text-gray-500 font-medium text-sm block">
                {order.created_at
                ? new Date(order.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                    })
                : "-"}
            </span>
            <span className="text-lg text-gray-500">#{order.order_id}</span>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 9H3M9 15l-6-6 6-6" />
          </svg>
          Back
        </Button>
      </div>
      <Card className="shadow-lg border border-gray-100">
        <CardContent>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Order Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Unit Price</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.kitchen_stock?.kitchen_item?.image ? (
                        <img
                          src={item.kitchen_stock.kitchen_item.image}
                          alt={item.kitchen_stock.kitchen_item.name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                      <div>
                        <span className="font-medium block text-gray-900">{item.kitchen_stock?.kitchen_item?.name || '-'}</span>
                        <span className="text-sm text-gray-500 block">{item.kitchen_stock?.kitchen_item?.name_bn || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{Number(item.quantity).toFixed(0)}</TableCell>
                  <TableCell className="text-center">৳{item.unit_price}</TableCell>
                  <TableCell className="text-center font-semibold text-gray-800">৳{item.total_price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <span className="text-lg font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded">
              Total: ৳{order.total_amount}
            </span>
          </div>
          {order.description && (
          <div className="mt-4">
            <div className="mb-3">
              <span className="font-semibold text-gray-700">Note:</span>{" "}
              <span className="text-gray-900">{order.description || "-"}</span>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}