import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
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
  Ticket,
  Utensils,
  Table,
  HardDrive
} from "lucide-react";
import { LogoutButton } from "../../hooks/auth/LogoutButton";

export default function Sidebar() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    employee: true,
    customer: true,
    restaurant: true,
    kitchen: true,
    financial: true,
    reports: true,
    dataManagement: true,
    settings: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
                <Link to="/dashboard/employees" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Employees</span>
                </Link>
                <Link to="/dashboard/attendance" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <ClipboardCheck className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Attendance</span>
                </Link>
                <Link to="/dashboard/salary" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Salary</span>
                </Link>
              </div>
            )}
          </div>

          {/* Customer Management */}
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

          {/* Restaurant Management */}
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
                <Link to="/dashboard/products" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Coffee className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Products</span>
                </Link>
                <Link to="/dashboard/orders" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <ShoppingCart className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Orders</span>
                </Link>
                <Link to="/dashboard/categories" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Package className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Categories</span>
                </Link>
                <Link to="/dashboard/tables" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Table className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Tables</span>
                </Link>
                <Link to="/dashboard/discounts" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Percent className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Discount</span>
                </Link>
              </div>
            )}
          </div>

          {/* Kitchen Management */}
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
                <Link to="/dashboard/kitchen-items" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Utensils className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Kitchen Items</span>
                </Link>
                <Link to="/dashboard/kitchen-stock" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <Package className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Kitchen Stock</span>
                </Link>
                <Link to="/dashboard/kitchen-orders" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <ClipboardCheck className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Kitchen Orders</span>
                </Link>
              </div>
            )}
          </div>

          {/* Financial */}
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

          {/* Reports */}
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
                <Link to="/dashboard/reports/inventory" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Inventory</span>
                </Link>
                <Link to="/dashboard/reports/financial-summary" className="flex items-center p-1 rounded-md hover:bg-accent pl-3">
                  <PieChart className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Financial</span>
                </Link>
              </div>
            )}
          </div>

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