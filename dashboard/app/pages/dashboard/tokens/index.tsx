import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select } from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Coffee,
  Utensils,
  Bell,
  Filter,
  AlertTriangle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import TokensSkeleton from "~/components/skeleton/TokensSkeleton";
import {ConfirmDialog} from "~/components/common/ConfirmDialog";

// Define Order Token interface
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface OrderToken {
  id: string;
  token_number: string;
  order_id: string;
  items: OrderItem[];
  area: 'BAR' | 'KITCHEN';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  prepared_by?: string;
}

// Dummy data for order tokens
const dummyOrderTokens: OrderToken[] = [
  {
    id: "1",
    token_number: "B-001",
    order_id: "ORD-2023-001",
    items: [
      { id: "item-1", name: "Cappuccino", quantity: 2 },
      { id: "item-2", name: "Espresso", quantity: 1, notes: "Extra hot" }
    ],
    area: "BAR",
    status: "pending",
    priority: "normal",
    created_at: "2023-06-20T09:30:00",
    updated_at: "2023-06-20T09:30:00"
  },
  {
    id: "2",
    token_number: "K-001",
    order_id: "ORD-2023-001",
    items: [
      { id: "item-3", name: "Breakfast Sandwich", quantity: 1 },
      { id: "item-4", name: "French Toast", quantity: 2, notes: "No syrup on one" }
    ],
    area: "KITCHEN",
    status: "preparing",
    priority: "normal",
    created_at: "2023-06-20T09:30:00",
    updated_at: "2023-06-20T09:35:00",
    prepared_by: "Chef Alex"
  },
  {
    id: "3",
    token_number: "B-002",
    order_id: "ORD-2023-002",
    items: [
      { id: "item-5", name: "Latte", quantity: 2 },
      { id: "item-6", name: "Hot Chocolate", quantity: 1 }
    ],
    area: "BAR",
    status: "ready",
    priority: "normal",
    created_at: "2023-06-20T09:40:00",
    updated_at: "2023-06-20T09:47:00",
    prepared_by: "Barista Sarah"
  },
  {
    id: "4",
    token_number: "K-002",
    order_id: "ORD-2023-003",
    items: [
      { id: "item-7", name: "Club Sandwich", quantity: 1, notes: "No mayo" },
      { id: "item-8", name: "French Fries", quantity: 1 }
    ],
    area: "KITCHEN",
    status: "pending",
    priority: "high",
    created_at: "2023-06-20T10:05:00",
    updated_at: "2023-06-20T10:05:00"
  },
  {
    id: "5",
    token_number: "B-003",
    order_id: "ORD-2023-004",
    items: [
      { id: "item-9", name: "Iced Coffee", quantity: 3 }
    ],
    area: "BAR",
    status: "preparing",
    priority: "urgent",
    created_at: "2023-06-20T10:10:00",
    updated_at: "2023-06-20T10:12:00",
    prepared_by: "Barista Mike"
  },
  {
    id: "6",
    token_number: "K-003",
    order_id: "ORD-2023-005",
    items: [
      { id: "item-10", name: "Veggie Wrap", quantity: 2, notes: "Gluten-free wrap" },
      { id: "item-11", name: "Caesar Salad", quantity: 1 }
    ],
    area: "KITCHEN",
    status: "cancelled",
    priority: "normal",
    created_at: "2023-06-20T10:15:00",
    updated_at: "2023-06-20T10:20:00"
  }
];

export default function OrderTokensPage() {
  const navigate = useNavigate();
  const [orderTokens, setOrderTokens] = useState<OrderToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<OrderToken[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionToken, setActionToken] = useState<{id: string, action: string} | null>(null);

  useEffect(() => {
    fetchOrderTokens();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrderTokens();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = orderTokens.filter(token =>
      token.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(token => token.status === statusFilter);
    }

    // Apply area filter
    if (areaFilter) {
      filtered = filtered.filter(token => token.area === areaFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(token => token.priority === priorityFilter);
    }

    setFilteredTokens(filtered);
  }, [orderTokens, searchTerm, statusFilter, areaFilter, priorityFilter]);

  const fetchOrderTokens = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrderTokens(dummyOrderTokens);
      setFilteredTokens(dummyOrderTokens);
    } catch (error) {
      console.error('Error fetching order tokens:', error);
      setOrderTokens([]);
      setFilteredTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: 'preparing' | 'ready' | 'served' | 'cancelled') => {
    setActionToken({ id, action: newStatus });
  };

  const handleActionConfirm = async () => {
    if (!actionToken) return;
    
    try {
      // Simulate API status update
      setOrderTokens(orderTokens.map(token => 
        token.id === actionToken.id 
          ? { 
              ...token, 
              status: actionToken.action as any,
              updated_at: new Date().toISOString(),
              prepared_by: actionToken.action === 'preparing' ? 'Current User' : token.prepared_by
            } 
          : token
      ));
      setActionToken(null);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setAreaFilter("");
    setPriorityFilter("");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getTimeFromNow = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal':
        return 'bg-gray-100 text-gray-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAreaIcon = (area: string) => {
    return area === 'BAR' ? 
      <Coffee className="w-4 h-4" /> : 
      <Utensils className="w-4 h-4" />;
  };

  const getAreaLabel = (area: string) => {
    return area === 'BAR' ? 'Bar' : 'Kitchen';
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getActionDialogDetails = () => {
    if (!actionToken) return { title: '', description: '' };
    
    const token = orderTokens.find(t => t.id === actionToken.id);
    if (!token) return { title: '', description: '' };
    
    switch (actionToken.action) {
      case 'preparing':
        return {
          title: "Start Preparing?",
          description: `Are you sure you want to start preparing order ${token.token_number}?`
        };
      case 'ready':
        return {
          title: "Mark as Ready?",
          description: `Confirm that order ${token.token_number} is ready for service.`
        };
      case 'served':
        return {
          title: "Mark as Served?",
          description: `Confirm that order ${token.token_number} has been served to the customer.`
        };
      case 'cancelled':
        return {
          title: "Cancel Order?",
          description: `Are you sure you want to cancel order ${token.token_number}? This action cannot be undone.`
        };
      default:
        return { title: '', description: '' };
    }
  };

  const hasActiveFilters = searchTerm || statusFilter || areaFilter || priorityFilter;
  const hasTokens = orderTokens.length > 0;
  const hasFilteredResults = filteredTokens.length > 0;

  // Count tokens by status
  const pendingTokens = orderTokens.filter(token => token.status === 'pending').length;
  const preparingTokens = orderTokens.filter(token => token.status === 'preparing').length;
  const readyTokens = orderTokens.filter(token => token.status === 'ready').length;

  if (isLoading) {
    return <TokensSkeleton />;
  }

  const { title: actionTitle, description: actionDescription } = getActionDialogDetails();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Order Tokens
          </h1>
          <p className="text-gray-600">Manage kitchen and bar orders</p>
        </div>
      </div>

      {/* Stats Cards - Only show if we have tokens */}
      {hasTokens && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className={pendingTokens > 0 ? "border-yellow-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className={`w-4 h-4 ${pendingTokens > 0 ? "text-yellow-500" : ""}`} />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingTokens > 0 ? "text-yellow-600" : ""}`}>
                {pendingTokens}
              </div>
            </CardContent>
          </Card>
          <Card className={preparingTokens > 0 ? "border-blue-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Coffee className={`w-4 h-4 ${preparingTokens > 0 ? "text-blue-500" : ""}`} />
                Preparing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${preparingTokens > 0 ? "text-blue-600" : ""}`}>
                {preparingTokens}
              </div>
            </CardContent>
          </Card>
          <Card className={readyTokens > 0 ? "border-green-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${readyTokens > 0 ? "text-green-500" : ""}`} />
                Ready for Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${readyTokens > 0 ? "text-green-600" : ""}`}>
                {readyTokens}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Total Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orderTokens.filter(token => 
                  ['pending', 'preparing', 'ready'].includes(token.status)
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Tokens Table or Empty State */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {hasTokens ? `Current Orders (${filteredTokens.length})` : 'Order Tokens'}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Areas</option>
                <option value="BAR">Bar</option>
                <option value="KITCHEN">Kitchen</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </Select>

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Priorities</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasTokens ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-center">Area</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token) => (
                    <TableRow key={token.id} className={
                      token.priority === 'urgent' ? 'bg-red-50' : 
                      token.priority === 'high' ? 'bg-orange-50' : ''
                    }>
                      <TableCell>
                        <div className="font-medium">{token.token_number}</div>
                        <div className="text-xs text-gray-500">Order: {token.order_id}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                          {getAreaIcon(token.area)}
                          {getAreaLabel(token.area)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {token.items.map((item, idx) => (
                            <div key={item.id} className={idx !== 0 ? "mt-1" : ""}>
                              <span className="font-medium">{item.quantity}x</span> {item.name}
                              {item.notes && (
                                <div className="text-xs text-gray-500 italic">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(token.priority)}>
                          {getPriorityLabel(token.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(token.status)}>
                          {getStatusLabel(token.status)}
                        </Badge>
                        {token.prepared_by && (
                          <div className="text-xs text-gray-500 mt-1">
                            By: {token.prepared_by}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium" title={format(new Date(token.created_at), 'MMM dd, yyyy h:mm a')}>
                          {formatTime(token.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeFromNow(token.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Show different actions based on current status */}
                        {token.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="w-full mb-1"
                            onClick={() => handleStatusUpdate(token.id, 'preparing')}
                          >
                            Start Preparing
                          </Button>
                        )}
                        
                        {token.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            className="w-full mb-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(token.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        
                        {token.status === 'ready' && (
                          <Button 
                            size="sm" 
                            className="w-full mb-1 bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleStatusUpdate(token.id, 'served')}
                          >
                            Mark Served
                          </Button>
                        )}
                        
                        {['pending', 'preparing'].includes(token.status) && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(token.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {['served', 'cancelled'].includes(token.status) && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/dashboard/orders/${token.order_id}`)}
                          >
                            View Order
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No filtered results message */}
              {!hasFilteredResults && hasActiveFilters && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No orders found matching your filters.</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try adjusting your search terms or clearing filters to see more results.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* No tokens at all - Empty state */
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active orders</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                New orders will appear here automatically when customers place them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={!!actionToken}
        title={actionTitle}
        description={actionDescription}
        confirmText={
          actionToken?.action === 'cancelled' ? 'Cancel Order' : 
          `Mark as ${actionToken?.action === 'preparing' ? 'Preparing' : 
                     actionToken?.action === 'ready' ? 'Ready' : 'Served'}`
        }
        cancelText="Back"
        onConfirm={handleActionConfirm}
        onCancel={() => setActionToken(null)}
      />
    </div>
  );
}