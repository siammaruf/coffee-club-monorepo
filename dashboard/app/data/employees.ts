// Mock data for employees
export const mockEmployees = [
  { id: 1, name: "John Doe", position: "Barista", email: "john.doe@example.com", phone: "(555) 123-4567", status: "Active" },
  { id: 2, name: "Jane Smith", position: "Manager", email: "jane.smith@example.com", phone: "(555) 234-5678", status: "Active" },
  { id: 3, name: "Robert Johnson", position: "Cashier", email: "robert.johnson@example.com", phone: "(555) 345-6789", status: "On Leave" },
  { id: 4, name: "Emily Davis", position: "Barista", email: "emily.davis@example.com", phone: "(555) 456-7890", status: "Active" },
  { id: 5, name: "Michael Wilson", position: "Barista", email: "michael.wilson@example.com", phone: "(555) 567-8901", status: "Inactive" },
  { id: 6, name: "Sarah Brown", position: "Cashier", email: "sarah.brown@example.com", phone: "(555) 678-9012", status: "Active" },
  { id: 7, name: "David Miller", position: "Barista", email: "david.miller@example.com", phone: "(555) 789-0123", status: "Active" },
  { id: 8, name: "Jennifer Taylor", position: "Manager", email: "jennifer.taylor@example.com", phone: "(555) 890-1234", status: "Active" },
  { id: 9, name: "James Anderson", position: "Cashier", email: "james.anderson@example.com", phone: "(555) 901-2345", status: "On Leave" },
  { id: 10, name: "Lisa Thomas", position: "Barista", email: "lisa.thomas@example.com", phone: "(555) 012-3456", status: "Active" },
  // Additional employees for pagination testing
  ...Array.from({ length: 40 }, (_, i) => ({
    id: i + 11,
    name: `Employee ${i + 11}`,
    position: i % 3 === 0 ? "Barista" : i % 3 === 1 ? "Cashier" : "Manager",
    email: `employee${i + 11}@example.com`,
    phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: i % 5 === 0 ? "Inactive" : i % 7 === 0 ? "On Leave" : "Active"
  }))
];

// Helper function to get status color
export function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-600";
    case "inactive":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

// Employee type definition
export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: string;
}