import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  UserCog,
  ShoppingCart,
  Coffee,
  Package,
  BarChart3,
  PieChart,
  UserCircle,
  LogOut,
  FileSpreadsheet,
  UserCheck,
  Percent,
  DollarSign,
  Utensils,
  Table,
  HardDrive,
  Globe,
  FileText,
  CalendarDays,
  MessageSquare,
  Handshake,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { useSelector } from "react-redux";
import { LogoutButton } from "../../hooks/auth/LogoutButton";
import { usePendingOrderCount } from "../../hooks/usePendingOrderCount";
import type { RootState } from "~/redux/store/rootReducer";

function useCan() {
  const user = useSelector((state: RootState) => state.auth.user);
  return (permission: string): boolean => {
    if (!user) return false;
    if (user.role?.toLowerCase() === 'admin') return true;
    return user.permissions?.includes(permission) ?? false;
  };
}

export default function Sidebar() {
  const pendingOrderCount = usePendingOrderCount();
  const can = useCan();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    employee: true,
    customer: true,
    restaurant: true,
    kitchen: true,
    financial: true,
    reports: true,
    dataManagement: true,
    website: true,
    settings: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Section visibility — show section only if at least one child is visible
  const showEmployeeSection = can('employees.view') || can('attendance.view') || can('salary.view');
  const showCustomerSection = can('customers.view');
  const showRestaurantSection = can('products.view') || can('orders.view') || can('categories.view') || can('tables.view') || can('discounts.view');
  const showKitchenSection = can('kitchen_items.view') || can('kitchen_stock.view');
  const showFinancialSection = can('expenses.view');
  const showReportsSection = can('reports.view');
  const showDataMgmtSection = can('data_management.view');
  const showWebsiteSection = can('website.view') || can('blog.view') || can('reservations.view') || can('contact_messages.view') || can('partners.view');

  return (
    <div className="w-64 bg-card border-r h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-yellow-500">Coffee Club Go</h2>
        <nav className="space-y-4">
          {/* Main Navigation */}
          <div>
            <Link to="/dashboard" className="flex items-center p-2 rounded-md hover:bg-accent">
              <LayoutDashboard className="w-5 h-5 mr-2" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Employee Management */}
          {showEmployeeSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("employee")}
              >
                <h3 className="text-base font-bold text-black">Employee Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.employee ? "-" : "+"}
                </span>
              </div>
              {openSections.employee && (
                <div className="space-y-1">
                  {can('employees.view') && (
                    <Link to="/dashboard/employees" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Employees</span>
                    </Link>
                  )}
                  {can('attendance.view') && (
                    <Link to="/dashboard/attendance" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <ClipboardCheck className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Attendance</span>
                    </Link>
                  )}
                  {can('salary.view') && (
                    <Link to="/dashboard/salary" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Salary</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customer Management */}
          {showCustomerSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("customer")}
              >
                <h3 className="text-base font-bold text-black">Customer Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.customer ? "-" : "+"}
                </span>
              </div>
              {openSections.customer && (
                <div className="space-y-1">
                  <Link to="/dashboard/customers" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Customers</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Restaurant Management */}
          {showRestaurantSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("restaurant")}
              >
                <h3 className="text-base font-bold text-black">Restaurant Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.restaurant ? "-" : "+"}
                </span>
              </div>
              {openSections.restaurant && (
                <div className="space-y-1">
                  {can('products.view') && (
                    <Link to="/dashboard/products" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Coffee className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Products</span>
                    </Link>
                  )}
                  {can('orders.view') && (
                    <Link to="/dashboard/orders" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <ShoppingCart className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Orders</span>
                      {pendingOrderCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {pendingOrderCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {can('orders.view') && (
                    <Link to="/dashboard/tokens" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Bell className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Order Tokens</span>
                    </Link>
                  )}
                  {can('categories.view') && (
                    <Link to="/dashboard/categories" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Categories</span>
                    </Link>
                  )}
                  {can('tables.view') && (
                    <Link to="/dashboard/tables" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Table className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Tables</span>
                    </Link>
                  )}
                  {can('discounts.view') && (
                    <Link to="/dashboard/discounts" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Percent className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Discount</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Kitchen Management */}
          {showKitchenSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("kitchen")}
              >
                <h3 className="text-base font-bold text-black">Kitchen Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.kitchen ? "-" : "+"}
                </span>
              </div>
              {openSections.kitchen && (
                <div className="space-y-1">
                  {can('kitchen_items.view') && (
                    <Link to="/dashboard/kitchen-items" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Utensils className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Kitchen Items</span>
                    </Link>
                  )}
                  {can('kitchen_stock.view') && (
                    <Link to="/dashboard/kitchen-stock" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Stock Management</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Financial */}
          {showFinancialSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("financial")}
              >
                <h3 className="text-base font-bold text-black">Financial</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.financial ? "-" : "+"}
                </span>
              </div>
              {openSections.financial && (
                <div className="space-y-1">
                  <Link to="/dashboard/expenses" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Expenses</span>
                  </Link>
                  <Link to="/dashboard/expenses/categories" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Categories</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {showReportsSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("reports")}
              >
                <h3 className="text-base font-bold text-black">Reports</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.reports ? "-" : "+"}
                </span>
              </div>
              {openSections.reports && (
                <div className="space-y-1">
                  <Link to="/dashboard/reports/sales" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Sales</span>
                  </Link>
                  <Link to="/dashboard/reports/financial-summary" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <PieChart className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Financial</span>
                  </Link>
                  <Link to="/dashboard/reports/kitchen-stock" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Kitchen Stock</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Data Management */}
          {showDataMgmtSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("dataManagement")}
              >
                <h3 className="text-base font-bold text-black">Data Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.dataManagement ? "-" : "+"}
                </span>
              </div>
              {openSections.dataManagement && (
                <div className="space-y-1">
                  <Link to="/dashboard?tab=export" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <HardDrive className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Data Management</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Website Management */}
          {showWebsiteSection && (
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1"
                onClick={() => toggleSection("website")}
              >
                <h3 className="text-base font-bold text-black">Website Management</h3>
                <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                  {openSections.website ? "-" : "+"}
                </span>
              </div>
              {openSections.website && (
                <div className="space-y-1">
                  {can('website.view') && (
                    <Link to="/dashboard/website" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Website Content</span>
                    </Link>
                  )}
                  {can('blog.view') && (
                    <Link to="/dashboard/blog" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Blog Posts</span>
                    </Link>
                  )}
                  {can('reservations.view') && (
                    <Link to="/dashboard/reservations" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Reservations</span>
                    </Link>
                  )}
                  {can('contact_messages.view') && (
                    <Link to="/dashboard/contact-messages" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Contact Messages</span>
                    </Link>
                  )}
                  {can('partners.view') && (
                    <Link to="/dashboard/partners" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                      <Handshake className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Partners</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Settings */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer mb-1"
              onClick={() => toggleSection("settings")}
            >
              <h3 className="text-base font-bold text-black">Settings</h3>
              <span className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white text-black text-lg select-none">
                {openSections.settings ? "-" : "+"}
              </span>
            </div>
            {openSections.settings && (
              <div className="space-y-1">
                <Link to="/dashboard/profile" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <UserCircle className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Profile</span>
                </Link>
                {can('settings.roles_permissions') && (
                  <Link to="/dashboard/settings/roles-permissions" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                    <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Roles & Permissions</span>
                  </Link>
                )}
                <LogoutButton className="flex items-center p-1 rounded-md hover:bg-accent pl-3 w-full text-left cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Logout</span>
                </LogoutButton>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
