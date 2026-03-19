import { useState, type ComponentProps } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../../hooks/useSidebar";
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
  ChevronDown,
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

function SidebarLink(props: ComponentProps<typeof Link>) {
  const { close } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === props.to || location.pathname.startsWith(`${props.to}/`);

  return (
    <Link
      {...props}
      className={`${props.className ?? ""} transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : ""
      }`}
      onClick={(e) => { props.onClick?.(e); close(); }}
    />
  );
}

function SectionHeader({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-between w-full py-1.5 px-1 rounded-md text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <span>{label}</span>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
      />
    </button>
  );
}

export default function Sidebar() {
  const pendingOrderCount = usePendingOrderCount();
  const can = useCan();
  const { close } = useSidebar();

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

  const showEmployeeSection = can('employees.view') || can('attendance.view') || can('salary.view');
  const showCustomerSection = can('customers.view');
  const showRestaurantSection = can('products.view') || can('orders.view') || can('categories.view') || can('tables.view') || can('discounts.view');
  const showKitchenSection = can('kitchen_items.view') || can('kitchen_stock.view');
  const showFinancialSection = can('expenses.view');
  const showReportsSection = can('reports.view');
  const showDataMgmtSection = can('data_management.view');
  const showWebsiteSection = can('website.view') || can('blog.view') || can('reservations.view') || can('contact_messages.view') || can('partners.view');

  const linkClass = "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors";

  return (
    <div className="w-64 bg-card border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/favicon/apple-touch-icon.png" alt="Coffee Club" className="w-8 h-8 rounded-lg" />
          <h2 className="text-lg font-bold tracking-tight">Coffee Club</h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard */}
        <SidebarLink to="/dashboard" className={linkClass.replace("text-muted-foreground", "text-foreground font-medium")}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </SidebarLink>

        {/* Employee Management */}
        {showEmployeeSection && (
          <div className="pt-3">
            <SectionHeader label="Employees" isOpen={openSections.employee} onToggle={() => toggleSection("employee")} />
            {openSections.employee && (
              <div className="mt-1 space-y-0.5">
                {can('employees.view') && (
                  <SidebarLink to="/dashboard/employees" className={linkClass}>
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </SidebarLink>
                )}
                {can('attendance.view') && (
                  <SidebarLink to="/dashboard/attendance" className={linkClass}>
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Attendance</span>
                  </SidebarLink>
                )}
                {can('salary.view') && (
                  <SidebarLink to="/dashboard/salary" className={linkClass}>
                    <DollarSign className="w-4 h-4" />
                    <span>Salary</span>
                  </SidebarLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customer Management */}
        {showCustomerSection && (
          <div className="pt-3">
            <SectionHeader label="Customers" isOpen={openSections.customer} onToggle={() => toggleSection("customer")} />
            {openSections.customer && (
              <div className="mt-1 space-y-0.5">
                <SidebarLink to="/dashboard/customers" className={linkClass}>
                  <UserCheck className="w-4 h-4" />
                  <span>Customers</span>
                </SidebarLink>
              </div>
            )}
          </div>
        )}

        {/* Restaurant Management */}
        {showRestaurantSection && (
          <div className="pt-3">
            <SectionHeader label="Restaurant" isOpen={openSections.restaurant} onToggle={() => toggleSection("restaurant")} />
            {openSections.restaurant && (
              <div className="mt-1 space-y-0.5">
                {can('products.view') && (
                  <SidebarLink to="/dashboard/products" className={linkClass}>
                    <Coffee className="w-4 h-4" />
                    <span>Products</span>
                  </SidebarLink>
                )}
                {can('orders.view') && (
                  <SidebarLink to="/dashboard/orders" className={linkClass}>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Orders</span>
                    {pendingOrderCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none">
                        {pendingOrderCount}
                      </span>
                    )}
                  </SidebarLink>
                )}
                {can('orders.view') && (
                  <SidebarLink to="/dashboard/tokens" className={linkClass}>
                    <Bell className="w-4 h-4" />
                    <span>Order Tokens</span>
                  </SidebarLink>
                )}
                {can('categories.view') && (
                  <SidebarLink to="/dashboard/categories" className={linkClass}>
                    <Package className="w-4 h-4" />
                    <span>Categories</span>
                  </SidebarLink>
                )}
                {can('tables.view') && (
                  <SidebarLink to="/dashboard/tables" className={linkClass}>
                    <Table className="w-4 h-4" />
                    <span>Tables</span>
                  </SidebarLink>
                )}
                {can('discounts.view') && (
                  <SidebarLink to="/dashboard/discounts" className={linkClass}>
                    <Percent className="w-4 h-4" />
                    <span>Discounts</span>
                  </SidebarLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Kitchen Management */}
        {showKitchenSection && (
          <div className="pt-3">
            <SectionHeader label="Kitchen" isOpen={openSections.kitchen} onToggle={() => toggleSection("kitchen")} />
            {openSections.kitchen && (
              <div className="mt-1 space-y-0.5">
                {can('kitchen_items.view') && (
                  <SidebarLink to="/dashboard/kitchen-items" className={linkClass}>
                    <Utensils className="w-4 h-4" />
                    <span>Kitchen Items</span>
                  </SidebarLink>
                )}
                {can('kitchen_stock.view') && (
                  <SidebarLink to="/dashboard/kitchen-stock" className={linkClass}>
                    <Package className="w-4 h-4" />
                    <span>Stock Management</span>
                  </SidebarLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Financial */}
        {showFinancialSection && (
          <div className="pt-3">
            <SectionHeader label="Financial" isOpen={openSections.financial} onToggle={() => toggleSection("financial")} />
            {openSections.financial && (
              <div className="mt-1 space-y-0.5">
                <SidebarLink to="/dashboard/expenses" className={linkClass}>
                  <DollarSign className="w-4 h-4" />
                  <span>Expenses</span>
                </SidebarLink>
                <SidebarLink to="/dashboard/expenses/categories" className={linkClass}>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Categories</span>
                </SidebarLink>
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {showReportsSection && (
          <div className="pt-3">
            <SectionHeader label="Reports" isOpen={openSections.reports} onToggle={() => toggleSection("reports")} />
            {openSections.reports && (
              <div className="mt-1 space-y-0.5">
                <SidebarLink to="/dashboard/reports/sales" className={linkClass}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Sales</span>
                </SidebarLink>
                <SidebarLink to="/dashboard/reports/financial-summary" className={linkClass}>
                  <PieChart className="w-4 h-4" />
                  <span>Financial</span>
                </SidebarLink>
                <SidebarLink to="/dashboard/reports/kitchen-stock" className={linkClass}>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Kitchen Stock</span>
                </SidebarLink>
              </div>
            )}
          </div>
        )}

        {/* Data Management */}
        {showDataMgmtSection && (
          <div className="pt-3">
            <SectionHeader label="Data" isOpen={openSections.dataManagement} onToggle={() => toggleSection("dataManagement")} />
            {openSections.dataManagement && (
              <div className="mt-1 space-y-0.5">
                <SidebarLink to="/dashboard?tab=export" className={linkClass}>
                  <HardDrive className="w-4 h-4" />
                  <span>Data Management</span>
                </SidebarLink>
              </div>
            )}
          </div>
        )}

        {/* Website Management */}
        {showWebsiteSection && (
          <div className="pt-3">
            <SectionHeader label="Website" isOpen={openSections.website} onToggle={() => toggleSection("website")} />
            {openSections.website && (
              <div className="mt-1 space-y-0.5">
                {can('website.view') && (
                  <SidebarLink to="/dashboard/website" className={linkClass}>
                    <Globe className="w-4 h-4" />
                    <span>Website Content</span>
                  </SidebarLink>
                )}
                {can('blog.view') && (
                  <SidebarLink to="/dashboard/blog" className={linkClass}>
                    <FileText className="w-4 h-4" />
                    <span>Blog Posts</span>
                  </SidebarLink>
                )}
                {can('reservations.view') && (
                  <SidebarLink to="/dashboard/reservations" className={linkClass}>
                    <CalendarDays className="w-4 h-4" />
                    <span>Reservations</span>
                  </SidebarLink>
                )}
                {can('contact_messages.view') && (
                  <SidebarLink to="/dashboard/contact-messages" className={linkClass}>
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Messages</span>
                  </SidebarLink>
                )}
                {can('partners.view') && (
                  <SidebarLink to="/dashboard/partners" className={linkClass}>
                    <Handshake className="w-4 h-4" />
                    <span>Partners</span>
                  </SidebarLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="pt-3">
          <SectionHeader label="Settings" isOpen={openSections.settings} onToggle={() => toggleSection("settings")} />
          {openSections.settings && (
            <div className="mt-1 space-y-0.5">
              <SidebarLink to="/dashboard/profile" className={linkClass}>
                <UserCircle className="w-4 h-4" />
                <span>Profile</span>
              </SidebarLink>
              {can('settings.roles_permissions') && (
                <SidebarLink to="/dashboard/settings/roles-permissions" className={linkClass}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Roles & Permissions</span>
                </SidebarLink>
              )}
              <LogoutButton
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left cursor-pointer"
                onClick={close}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </LogoutButton>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
