import { UserRole } from '../../users/enum/user-role.enum';

export const DEFAULT_PERMISSIONS: Array<{
  name: string;
  resource: string;
  action: string;
  description: string;
}> = [
  // Orders
  { name: 'orders.view', resource: 'orders', action: 'view', description: 'View all orders' },
  { name: 'orders.create', resource: 'orders', action: 'create', description: 'Create new orders' },
  { name: 'orders.edit', resource: 'orders', action: 'edit', description: 'Edit existing orders' },
  { name: 'orders.delete', resource: 'orders', action: 'delete', description: 'Delete orders' },
  // Employees
  { name: 'employees.view', resource: 'employees', action: 'view', description: 'View employee list' },
  { name: 'employees.create', resource: 'employees', action: 'create', description: 'Create new employees' },
  { name: 'employees.edit', resource: 'employees', action: 'edit', description: 'Edit employee details' },
  { name: 'employees.delete', resource: 'employees', action: 'delete', description: 'Delete employees' },
  // Products
  { name: 'products.view', resource: 'products', action: 'view', description: 'View menu items/products' },
  { name: 'products.create', resource: 'products', action: 'create', description: 'Create new products' },
  { name: 'products.edit', resource: 'products', action: 'edit', description: 'Edit products' },
  { name: 'products.delete', resource: 'products', action: 'delete', description: 'Delete products' },
  // Categories
  { name: 'categories.view', resource: 'categories', action: 'view', description: 'View categories' },
  { name: 'categories.create', resource: 'categories', action: 'create', description: 'Create categories' },
  { name: 'categories.edit', resource: 'categories', action: 'edit', description: 'Edit categories' },
  { name: 'categories.delete', resource: 'categories', action: 'delete', description: 'Delete categories' },
  // Customers
  { name: 'customers.view', resource: 'customers', action: 'view', description: 'View customers' },
  { name: 'customers.create', resource: 'customers', action: 'create', description: 'Create customers' },
  { name: 'customers.edit', resource: 'customers', action: 'edit', description: 'Edit customer details' },
  { name: 'customers.delete', resource: 'customers', action: 'delete', description: 'Delete customers' },
  // Kitchen Items
  { name: 'kitchen_items.view', resource: 'kitchen_items', action: 'view', description: 'View kitchen items' },
  { name: 'kitchen_items.create', resource: 'kitchen_items', action: 'create', description: 'Create kitchen items' },
  { name: 'kitchen_items.edit', resource: 'kitchen_items', action: 'edit', description: 'Edit kitchen items' },
  { name: 'kitchen_items.delete', resource: 'kitchen_items', action: 'delete', description: 'Delete kitchen items' },
  // Kitchen Stock
  { name: 'kitchen_stock.view', resource: 'kitchen_stock', action: 'view', description: 'View kitchen stock' },
  { name: 'kitchen_stock.create', resource: 'kitchen_stock', action: 'create', description: 'Add kitchen stock' },
  { name: 'kitchen_stock.edit', resource: 'kitchen_stock', action: 'edit', description: 'Edit kitchen stock' },
  { name: 'kitchen_stock.delete', resource: 'kitchen_stock', action: 'delete', description: 'Delete kitchen stock' },
  // Tables
  { name: 'tables.view', resource: 'tables', action: 'view', description: 'View tables' },
  { name: 'tables.create', resource: 'tables', action: 'create', description: 'Create tables' },
  { name: 'tables.edit', resource: 'tables', action: 'edit', description: 'Edit tables' },
  { name: 'tables.delete', resource: 'tables', action: 'delete', description: 'Delete tables' },
  // Attendance
  { name: 'attendance.view', resource: 'attendance', action: 'view', description: 'View attendance records' },
  { name: 'attendance.create', resource: 'attendance', action: 'create', description: 'Mark attendance' },
  { name: 'attendance.edit', resource: 'attendance', action: 'edit', description: 'Edit attendance records' },
  // Salary
  { name: 'salary.view', resource: 'salary', action: 'view', description: 'View salary records' },
  { name: 'salary.create', resource: 'salary', action: 'create', description: 'Create salary payments' },
  // Expenses
  { name: 'expenses.view', resource: 'expenses', action: 'view', description: 'View expenses' },
  { name: 'expenses.create', resource: 'expenses', action: 'create', description: 'Create expenses' },
  { name: 'expenses.edit', resource: 'expenses', action: 'edit', description: 'Edit expenses' },
  { name: 'expenses.delete', resource: 'expenses', action: 'delete', description: 'Delete expenses' },
  // Discounts
  { name: 'discounts.view', resource: 'discounts', action: 'view', description: 'View discounts' },
  { name: 'discounts.create', resource: 'discounts', action: 'create', description: 'Create discounts' },
  { name: 'discounts.edit', resource: 'discounts', action: 'edit', description: 'Edit discounts' },
  { name: 'discounts.delete', resource: 'discounts', action: 'delete', description: 'Delete discounts' },
  // Reports
  { name: 'reports.view', resource: 'reports', action: 'view', description: 'View reports' },
  // Website
  { name: 'website.view', resource: 'website', action: 'view', description: 'View website content' },
  { name: 'website.edit', resource: 'website', action: 'edit', description: 'Edit website content' },
  // Blog
  { name: 'blog.view', resource: 'blog', action: 'view', description: 'View blog posts' },
  { name: 'blog.create', resource: 'blog', action: 'create', description: 'Create blog posts' },
  { name: 'blog.edit', resource: 'blog', action: 'edit', description: 'Edit blog posts' },
  { name: 'blog.delete', resource: 'blog', action: 'delete', description: 'Delete blog posts' },
  // Reservations
  { name: 'reservations.view', resource: 'reservations', action: 'view', description: 'View reservations' },
  { name: 'reservations.edit', resource: 'reservations', action: 'edit', description: 'Edit reservations' },
  // Contact Messages
  { name: 'contact_messages.view', resource: 'contact_messages', action: 'view', description: 'View contact messages' },
  { name: 'contact_messages.delete', resource: 'contact_messages', action: 'delete', description: 'Delete contact messages' },
  // Partners
  { name: 'partners.view', resource: 'partners', action: 'view', description: 'View partners' },
  { name: 'partners.create', resource: 'partners', action: 'create', description: 'Create partners' },
  { name: 'partners.edit', resource: 'partners', action: 'edit', description: 'Edit partners' },
  { name: 'partners.delete', resource: 'partners', action: 'delete', description: 'Delete partners' },
  // Data Management
  { name: 'data_management.view', resource: 'data_management', action: 'view', description: 'Access data management' },
  { name: 'data_management.export', resource: 'data_management', action: 'export', description: 'Export data' },
  // Settings
  { name: 'settings.roles_permissions', resource: 'settings', action: 'roles_permissions', description: 'Manage roles & permissions' },
  // WiFi Settings
  { name: 'wifi_settings.view', resource: 'wifi_settings', action: 'view', description: 'View WiFi settings' },
  { name: 'wifi_settings.edit', resource: 'wifi_settings', action: 'edit', description: 'Edit WiFi settings' },
  // WhatsApp
  { name: 'whatsapp.view', resource: 'whatsapp', action: 'view', description: 'View WhatsApp settings, contacts, messages, promotions' },
  { name: 'whatsapp.manage', resource: 'whatsapp', action: 'manage', description: 'Manage WhatsApp connection, contacts, config, promotions' },
  { name: 'whatsapp.send', resource: 'whatsapp', action: 'send', description: 'Send WhatsApp messages, promotions, trigger reports' },
];

export const ROLE_PERMISSION_DEFAULTS: Record<string, string[]> = {
  [UserRole.MANAGER]: [
    'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
    'employees.view', 'employees.create', 'employees.edit',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    'customers.view', 'customers.create', 'customers.edit',
    'kitchen_items.view', 'kitchen_items.create', 'kitchen_items.edit', 'kitchen_items.delete',
    'kitchen_stock.view', 'kitchen_stock.create', 'kitchen_stock.edit', 'kitchen_stock.delete',
    'tables.view', 'tables.create', 'tables.edit', 'tables.delete',
    'attendance.view', 'attendance.create', 'attendance.edit',
    'salary.view', 'salary.create',
    'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
    'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
    'reports.view',
    'website.view', 'website.edit',
    'blog.view', 'blog.create', 'blog.edit', 'blog.delete',
    'reservations.view', 'reservations.edit',
    'contact_messages.view', 'contact_messages.delete',
    'partners.view', 'partners.create', 'partners.edit', 'partners.delete',
    'data_management.view', 'data_management.export',
    'wifi_settings.view', 'wifi_settings.edit',
    'whatsapp.view', 'whatsapp.manage', 'whatsapp.send',
  ],
  [UserRole.CHEF]: [
    'kitchen_items.view', 'kitchen_items.create', 'kitchen_items.edit',
    'kitchen_stock.view', 'kitchen_stock.create', 'kitchen_stock.edit',
    'orders.view',
    'products.view',
  ],
  [UserRole.BARISTA]: [
    'orders.view', 'orders.create', 'orders.edit',
    'products.view',
    'categories.view',
    'tables.view',
    'kitchen_stock.view',
    'discounts.view',
  ],
  [UserRole.STUFF]: [
    'orders.view',
    'products.view',
    'categories.view',
    'tables.view',
    'customers.view',
    'kitchen_stock.view',
    'attendance.view',
  ],
};
