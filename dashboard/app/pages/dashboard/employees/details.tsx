import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { ArrowLeft, Edit, UserX, UserCheck, Trash2, MapPin, Phone, Mail, CreditCard, Calendar, Building, MailIcon, RefreshCw, DollarSign } from 'lucide-react';
import type { User } from '~/types/user';
import { userService } from '~/services/httpServices/userService';
import { getStatusColor } from '~/data/employees';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { EmployeeDetailsSkeleton } from '~/components/skeleton/EmployeeDetailsSkeleton';
import { ConfirmDialog } from '~/components/ui/confirm-dialog';
import { StatusDialog } from '~/components/ui/status-dialog';
import type { RootState } from '~/redux/store/rootReducer';

export default function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const isCurrentUser = currentUser && user && (
    currentUser.id === user.id || 
    currentUser.id === id
  );
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
    destructive?: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {},
    destructive: false,
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    autoCloseDelay?: number;
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch employee details');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const showStatusDialog = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    autoCloseDelay?: number
  ) => {
    setStatusDialog({
      open: true,
      title,
      message,
      type,
      autoCloseDelay,
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({
      open: false,
      title: '',
      message: '',
      type: 'info',
    });
  };

  const handleEdit = () => {
    navigate(`/dashboard/employees/edit/${id}`);
  };

  const handleDeleteConfirm = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This action cannot be undone.',
      destructive: true,
      action: handleDeleteAction,
    });
  };

  const handleDeleteAction = async () => {
    if (!user || !id) return;
    
    try {
      setActionLoading('delete');
      await userService.deleteUser(id);
      showStatusDialog('Success', 'Employee deleted successfully', 'success', 2000); 
      setTimeout(() => {
        navigate('/dashboard/employees');
      }, 2500);
    } catch (error) {
      console.error('Error deleting employee:', error);
      showStatusDialog('Error', 'Failed to delete employee', 'error', 5000); 
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatusConfirm = () => {
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    setConfirmDialog({
      open: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
      message: `Are you sure you want to ${action} this employee?`,
      destructive: action === 'deactivate',
      action: () => handleToggleStatusAction(newStatus),
    });
  };

  const handleToggleStatusAction = async (newStatus: 'active' | 'inactive') => {
    if (!user || !id) return;
    
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    try {
      setActionLoading('status');
      await userService.updateUserStatus(id, newStatus);
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      showStatusDialog('Success', `Employee ${action}d successfully`, 'success', 2000);
    } catch (error) {
      console.error(`Error ${action}ing employee:`, error);
      showStatusDialog('Error', `Failed to ${action} employee`, 'error', 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendResetPasswordConfirm = () => {
    if (!user) return;
    
    setConfirmDialog({
      open: true,
      title: 'Send Password Reset Email',
      message: 'Are you sure you want to send a password reset email to this employee?',
      destructive: false,
      action: handleSendResetPasswordAction,
    });
  };

  const handleSendResetPasswordAction = async () => {
    if (!user || !id) return;
    
    try {
      setActionLoading('reset-password');
      await userService.sendResetPasswordEmail(id);
      showStatusDialog('Success', 'Password reset email sent successfully', 'success', 3000);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      showStatusDialog('Error', 'Failed to send password reset email', 'error', 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      action: () => {},
      destructive: false,
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  if (loading) {
    return <EmployeeDetailsSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || 'Employee not found'}</div>
          <Button onClick={() => navigate('/dashboard/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const isActive = user.status === 'active';

  return (
    <>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/employees')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Employee Details</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            
            {!isCurrentUser && (
              <Button 
                variant="outline" 
                onClick={handleToggleStatusConfirm}
                disabled={actionLoading === 'status'}
                className={`flex items-center gap-2 ${
                  isActive 
                    ? 'text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300' 
                    : 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                }`}
              >
                {actionLoading === 'status' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isActive ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleSendResetPasswordConfirm}
              disabled={actionLoading === 'reset-password'}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              {actionLoading === 'reset-password' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <MailIcon className="h-4 w-4" />
              )}
              Reset Password
            </Button>
            
            {!isCurrentUser && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={actionLoading === 'delete'}
                className="flex items-center gap-2"
              >
                {actionLoading === 'delete' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <img 
                src={user.picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRTVFN0VCIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDgiIHI9IjE4IiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0zMCA5NkMzMCA3OS40MzE1IDQzLjQzMTUgNjYgNjAgNjZDNzYuNTY4NSA2NiA5MCA3OS40MzE1IDkwIDk2SDMwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mx-auto mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRTVFN0VCIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDgiIHI9IjE4IiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0zMCA5NkMzMCA3OS40MzE1IDQzLjQzMTUgNjYgNjAgNjZDNzYuNTY4NSA2NiA5MCA3OS40MzE1IDkwIDk2SDMwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
                }}
              />
              <h2 className="text-xl font-semibold mb-2">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-600 mb-3">{user.role}</p>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
              
              {isCurrentUser && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    This is you
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date Joined</p>
                    <p className="font-medium">{new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Base Salary</p>
                    <p className="font-medium">{formatCurrency(user.base_salary || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">NID Number</p>
                    <p className="font-medium">{user.nid_number}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>NID Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">NID Front</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {user.nid_front_picture ? (
                      <img 
                        src={user.nid_front_picture} 
                        alt="NID Front" 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <p className="text-gray-500">No front image uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">NID Back</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {user.nid_back_picture ? (
                      <img 
                        src={user.nid_back_picture} 
                        alt="NID Back" 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <p className="text-gray-500">No back image uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.banks && user.banks.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Bank Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.banks.map((bank, index) => (
                    <div key={bank.id || index} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{bank.bank_name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Branch:</span> {bank.branch_name}</p>
                        <p><span className="text-gray-500">Account:</span> {bank.account_number}</p>
                        <p><span className="text-gray-500">Routing:</span> {bank.routing_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.action();
          closeConfirmDialog();
        }}
        onCancel={closeConfirmDialog}
        destructive={confirmDialog.destructive}
        confirmText={confirmDialog.destructive ? "Delete" : "Confirm"}
        cancelText="Cancel"
      />

      <StatusDialog
        open={statusDialog.open}
        title={statusDialog.title}
        message={statusDialog.message}
        type={statusDialog.type}
        onClose={closeStatusDialog}
        autoCloseDelay={statusDialog.autoCloseDelay}
      />
    </>
  );
}