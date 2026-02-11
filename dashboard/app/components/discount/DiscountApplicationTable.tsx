import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { DiscountApplication } from "~/types/discountApplication";
import { Plus } from "lucide-react";

interface Props {
  applications: DiscountApplication[];
  onAddClick: () => void;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export default function DiscountApplicationTable({
  applications,
  onAddClick,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Discount Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="p-4 bg-muted/50">
            <div className="grid grid-cols-6 font-medium text-sm">
              <div className="text-left">Type</div>
              <div className="text-left">Discount</div>
              <div className="text-left">Customers</div>
              <div className="text-left">Products</div>
              <div className="text-left">Categories</div>
              <div className="text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y">
            {applications.length > 0 ? (
              applications.map(app => (
                <div key={app.id} className="p-4 hover:bg-muted/50">
                  <div className="grid grid-cols-6 text-sm items-center">
                    <div className="truncate">{app.discount_type}</div>
                    <div className="truncate">
                      {typeof app.discount === "object" && app.discount !== null
                        ? app.discount.name || app.discount.code || app.discount.id
                        : app.discount}
                    </div>
                    <div className="truncate">
                      {(() => {
                        const list = (app.customers || [])
                          .map((c: any) =>
                            typeof c === "object" && c !== null
                              ? c.name || c.email || c.id
                              : c
                          );
                        return list.length > 0 ? list.join(", ") : "-";
                      })()}
                    </div>
                    <div className="truncate">
                      {(() => {
                        const list = (app.products || [])
                          .map((p: any) =>
                            typeof p === "object" && p !== null
                              ? p.name || p.id
                              : p
                          );
                        return list.length > 0 ? list.join(", ") : "-";
                      })()}
                    </div>
                    <div className="truncate">
                      {(() => {
                        const list = (app.categories || [])
                          .map((cat: any) =>
                            typeof cat === "object" && cat !== null
                              ? cat.name || cat.id
                              : cat
                          );
                        return list.length > 0 ? list.join(", ") : "-";
                      })()}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => {/* handle edit here */}}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => {/* handle delete here */}}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No discount applications found.
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 p-4 border-t">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => onPageChange && onPageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange && onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}