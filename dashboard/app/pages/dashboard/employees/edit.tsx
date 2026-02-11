import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useForm, type FieldValues } from 'react-hook-form';
import { ArrowLeft, User as UserIcon, Mail, Phone, CreditCard, Upload, MapPin, Calendar, Building2, DollarSign } from 'lucide-react';
import type { User } from '~/types/user';
import { userService } from '~/services/httpServices/userService';
import { EmployeeEditSkeleton } from '~/components/skeleton/EmployeeEditSkeleton';
import { StatusMessage } from '~/components/ui/StatusMessage';
import { useStatusMessage, withErrorHandling } from '~/utils/errorUtils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { UserRole } from './enum/userRole';

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control
  } = useForm();

  const {
    statusMessage,
    setError,
    setSuccess,
    clearStatus,
    isError,
    isSuccess
  } = useStatusMessage();

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        const userData = (response as any).data as User;
        setUser(userData);

        setValue('first_name', userData.first_name);
        setValue('last_name', userData.last_name);
        setValue('email', userData.email);
        setValue('phone', userData.phone);
        setValue('nid_number', userData.nid_number);
        setValue('address', userData.address);
        setValue('status', userData.status === 'active');
        setValue('role', userData.role);
        setValue('date_joined', userData.date_joined?.split('T')[0]);
        setValue('base_salary', userData.base_salary); // <-- Add this line
        
        if (userData.banks && userData.banks.length > 0) {
          const bank = userData.banks[0];
          setValue('bank_name', bank.bank_name);
          setValue('branch_name', bank.branch_name);
          setValue('account_number', bank.account_number);
          setValue('routing_number', bank.routing_number);
        }
        
        if (userData.picture) {
          setProfilePreview(userData.picture);
        }
        if (userData.nid_front_picture) {
          setNidFrontPreview(userData.nid_front_picture);
        }
        if (userData.nid_back_picture) {
          setNidBackPreview(userData.nid_back_picture);
        }
        
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError(error, 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]); 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setPreview: (preview: string | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    clearStatus();
    
    const updateUserWithErrorHandling = withErrorHandling(
      async (formData: FormData) => {
        return await userService.updateUser(id, formData as any);
      },
      (error) => {
        setError(error, 'Error updating employee. Please try again.');
      },
      (response) => {
        setSuccess(response, 'Employee updated successfully!');
        setTimeout(() => {
          //navigate(`/dashboard/employees/${id}`);
        }, 1500);
      }
    );
    
    try {
      (data as any).status = data.status ? "active" : "inactive";

      const hasBankData = data.bank_name || data.branch_name || data.account_number || data.routing_number;
      
      if (hasBankData) {
        const bank = {
          bank_name: data.bank_name,
          branch_name: data.branch_name,
          account_number: data.account_number,
          routing_number: data.routing_number
        };
        
        (data as any).bank = bank;
      }
      
      delete (data as any).bank_name;
      delete (data as any).branch_name;
      delete (data as any).account_number;
      delete (data as any).routing_number;

      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          if (value.length > 0 && value[0] instanceof File) {
            formData.append(key, value[0], value[0].name);
          }
        } else if (value instanceof File) {
          formData.append(key, value, value.name);
        } else if (typeof value === 'object' && value !== null) {
          const stringified = JSON.stringify(value);
          if (stringified !== '{}' && stringified !== 'null') {
            formData.append(key, stringified);
          }
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
      
      await updateUserWithErrorHandling(formData);
      
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setError(error, 'Error updating employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <EmployeeEditSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/employees">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Employee Not Found</h2>
            <p className="text-muted-foreground">
              The employee you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to={`/dashboard/employees/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
          <p className="text-muted-foreground">
            Update {user.first_name} {user.last_name}'s information
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <StatusMessage 
              status={statusMessage} 
              onDismiss={clearStatus}
              className="mt-3"
            />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="first_name" 
                        placeholder="Enter first name" 
                        {...register('first_name', { 
                          required: 'First name is required',
                          minLength: { value: 2, message: 'First name must be at least 2 characters' }
                        })}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-sm text-red-500">{String(errors.first_name.message || 'This field is required')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="last_name" 
                        placeholder="Enter last name" 
                        {...register('last_name', { 
                          required: 'Last name is required',
                          minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                        })}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-sm text-red-500">{String(errors.last_name.message || 'This field is required')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="employee@example.com" 
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{String(errors.email.message || 'This field is required')}</p>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="(555) 123-4567" 
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\d{11}$/,
                          message: 'Phone number must be 11 digits'
                        }
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{String(errors.phone.message || 'This field is required')}</p>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="base_salary">Base Salary</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="base_salary" 
                      type="number"
                      placeholder="Enter base salary" 
                      {...register('base_salary', { 
                        required: 'Base salary is required',
                        min: { value: 0, message: 'Base salary cannot be negative' },
                        valueAsNumber: true
                      })}
                    />
                  </div>
                  {errors.base_salary && (
                    <p className="text-sm text-red-500">{String(errors.base_salary.message || 'This field is required')}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Identification</h3>
                <div className="space-y-2">
                  <Label htmlFor="nid_number">NID Number</Label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="nid_number" 
                      placeholder="Enter NID number" 
                      {...register('nid_number', { 
                        required: 'NID number is required',
                        minLength: { value: 10, message: 'NID number must be at least 10 characters' }
                      })}
                    />
                  </div>
                  {errors.nid_number && (
                    <p className="text-sm text-red-500">{String(errors.nid_number.message || 'This field is required')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nid_front">NID Front</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="nid_front" 
                        type="file" 
                        accept="image/*" 
                        className="flex-1" 
                        {...register('nid_front_picture')}
                        onChange={(e) => handleFileChange(e, setNidFrontPreview)}
                      />
                      <Button type="button" size="icon" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {nidFrontPreview && (
                      <div className="mt-2 relative">
                        <div className="relative rounded-md overflow-hidden border border-border flex justify-center max-h-[300px]">
                          <img 
                            src={nidFrontPreview} 
                            alt="NID Front Preview" 
                            className="w-auto max-h-[300px] object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nid_back">NID Back</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="nid_back" 
                        type="file" 
                        accept="image/*" 
                        className="flex-1"
                        {...register('nid_back_picture')}
                        onChange={(e) => handleFileChange(e, setNidBackPreview)}
                      />
                      <Button type="button" size="icon" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {nidBackPreview && (
                      <div className="mt-2 relative">
                        <div className="relative rounded-md overflow-hidden border border-border flex justify-center max-h-[300px]">
                          <img 
                            src={nidBackPreview} 
                            alt="NID Back Preview" 
                            className="w-auto max-h-[300px] object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Address & Employment</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="address" 
                        placeholder="Enter full address" 
                        {...register('address', { 
                          required: 'Address is required',
                          minLength: { value: 10, message: 'Address must be at least 10 characters' }
                        })}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-red-500">{String(errors.address.message || 'This field is required')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select 
                        {...register('role', { required: 'Role is required' })}
                        defaultValue={user?.role || ''}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select role</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.STUFF}>Stuff</option>   
                        <option value={UserRole.BARISTA}>Barista</option>
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.CHEF}>Chef</option>
                      </select>
                      {errors.role && (
                        <p className="text-sm text-red-500">{String(errors.role.message || 'This field is required')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_joined">Date Joined</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="date_joined" 
                          type="date" 
                          {...register('date_joined', { 
                            required: 'Date joined is required'
                          })}
                        />
                      </div>
                      {errors.date_joined && (
                        <p className="text-sm text-red-500">{String(errors.date_joined.message || 'This field is required')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Banking Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="bank_name" 
                        placeholder="Enter bank name" 
                        {...register('bank_name')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_name">Branch Name</Label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="branch_name" 
                        placeholder="Enter branch name" 
                        {...register('branch_name')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="account_number" 
                        placeholder="Enter account number" 
                        {...register('account_number')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="routing_number" 
                        placeholder="Enter routing number" 
                        {...register('routing_number')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/dashboard/employees/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? 'Updating...' : 'Update Employee'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="w-80">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="picture">Upload Picture</Label>
              <Input 
                id="picture" 
                type="file" 
                accept="image/*" 
                {...register('picture')}
                onChange={(e) => handleFileChange(e, setProfilePreview)}
              />
            </div>
            {profilePreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img 
                    src={profilePreview} 
                    alt="Profile Preview" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}