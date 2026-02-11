import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Percent } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import AddDiscountModal from "~/components/modals/AddDiscountModal";
import AddDiscountApplicationModal from "~/components/modals/AddDiscountApplicationModal";
import { discountService } from "~/services/httpServices/discountService";
import { discountApplicationService } from "~/services/httpServices/discountApplicationService";
import type { Discount } from "~/types/discount";
import type { DiscountApplication } from "~/types/discountApplication";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import DiscountApplicationTable from "~/components/discount/DiscountApplicationTable";

const TABS = ["Discount List", "Discount Application"];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, "id">>({
    name: "",
    discount_type: "",
    discount_value: 0,
    description: "",
    expiry_date: "",
  });
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [discountApplications, setDiscountApplications] = useState<DiscountApplication[]>([]);

  // Fetch discounts from API
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await discountService.getAll();
      setDiscounts(res.data || []);
    } catch (error) {
      setDiscounts([]);
    }
  };

  const filteredDiscounts = discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.discount_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (activeTab === "Discount Application") {
      fetchDiscountApplications();
    }
  }, [activeTab]);

  const fetchDiscountApplications = async () => {
    try {
      const res = await discountApplicationService.getAll();
      setDiscountApplications(res.data || []);
    } catch (error) {
      setDiscountApplications([]);
    }
  };

  const handleAddDiscount = async (discountData: Omit<Discount, "id">) => {
    try {
      await discountService.create(discountData as any);
      setShowAddModal(false);
      setNewDiscount({ name: "", discount_type: "", discount_value: 0, description: "", expiry_date: "" });
      fetchDiscounts();
    } catch (error) {
    }
  };

  const handleAddDiscountApplication = async (applicationData: Omit<DiscountApplication, "id">) => {
    try {
      await discountApplicationService.create(applicationData as any);
      setShowAddApplicationModal(false);
      fetchDiscountApplications();
    } catch (error) {
      // Optionally handle error
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewDiscount({ name: "", discount_type: "", discount_value: 0, description: "", expiry_date: "" });
  };

  const handleEdit = (id: string) => {
    console.log("Edit discount:", id);
  };

  const handleDelete = (id: string) => {
    const discount = discounts.find(d => d.id === id);
    if (discount) setDiscountToDelete(discount);
  };

  const handleDeleteConfirm = async () => {
    if (!discountToDelete) return;
    setIsDeleting(true);
    try {
      await discountService.delete(discountToDelete.id);
      setDiscounts(discounts.filter(d => d.id !== discountToDelete.id));
      setDiscountToDelete(null);
    } catch (error) {
      // Optionally show error feedback
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDiscountValue = (type: string, value: number) => {
    return type === "percentage" ? `${value}%` : `$${value}`;
  };

  const getDiscountTypeColor = (type: string) => {
    return type === "percentage" 
      ? "bg-green-100 text-green-800" 
      : "bg-blue-100 text-blue-800";
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < now) {
      return { label: "Expired", color: "bg-red-100 text-red-800" };
    }
    
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 7) {
      return { label: "Expiring Soon", color: "bg-yellow-100 text-yellow-800" };
    }
    
    return { label: "Active", color: "bg-green-100 text-green-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">Manage your discount offers and promotions</p>
        </div>
        {activeTab === "Discount List" ? (
          <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Discount
          </Button>
        ) : (
          <Button className="flex items-center gap-2" onClick={() => setShowAddApplicationModal(true)}>
            <Plus className="h-4 w-4" />
            Add Discount Application
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Discount List" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                <span>Discount List ({filteredDiscounts.length})</span>
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discounts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-6 font-medium text-sm">
                  <div className="text-left">Name</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Value</div>
                  <div className="text-center">Expiry Date</div>
                  <div className="text-center">Status</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {filteredDiscounts.length > 0 ? (
                  filteredDiscounts.map(discount => {
                    const status = getStatus(discount.expiry_date);
                    return (
                      <div key={discount.id} className="p-4 hover:bg-muted/50">
                        <div className="grid grid-cols-6 text-sm items-center">
                          <div className="text-left flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-100 flex-shrink-0">
                              <Percent className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{discount.name}</span>
                              {discount.description && (
                                <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {discount.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge className={getDiscountTypeColor(discount.discount_type)}>
                              {discount.discount_type === "percentage" ? "Percentage" : "Fixed Amount"}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-lg">
                              {formatDiscountValue(discount.discount_type, discount.discount_value)}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className={`text-sm ${isExpired(discount.expiry_date) ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatDate(discount.expiry_date)}
                            </span>
                          </div>
                          <div className="text-center">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(discount.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(discount.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? (
                      <>
                        <p>No discounts found matching "{searchTerm}".</p>
                        <p className="text-sm mt-1">Try adjusting your search terms.</p>
                      </>
                    ) : (
                      <>
                        <p>No discounts available.</p>
                        <p className="text-sm mt-1">Create your first discount to get started.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "Discount Application" && (
        <DiscountApplicationTable
          applications={discountApplications}
          onAddClick={() => setShowAddApplicationModal(true)}
        />
      )}

      <AddDiscountModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={handleAddDiscount}
        newDiscount={newDiscount}
        setNewDiscount={setNewDiscount}
      />

      <AddDiscountApplicationModal
        isOpen={showAddApplicationModal}
        onClose={() => setShowAddApplicationModal(false)}
        onAdd={handleAddDiscountApplication}
      />

      <ConfirmDialog
        open={!!discountToDelete}
        title="Delete Discount"
        description={`Are you sure you want to delete "${discountToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDiscountToDelete(null)}
      />
    </div>
  );
}