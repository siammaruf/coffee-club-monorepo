import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Search, 
  X, 
  User as UserIcon,
  DollarSign,
  Plus,
  Minus,
  Upload,
  ArrowLeft,
  Save,
  Calendar,
  Users,
  Edit
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { userService } from '~/services/httpServices/userService';
import { salaryService } from '~/services/httpServices/salaryService';
import type { User } from '~/types/user';
import type { SalaryFormData } from '~/types/salary';

// Utility function to format currency in BDT
function formatCurrency(amount: number) {
  return amount.toLocaleString('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function CreateSalaryPage() {
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isCustomMonth, setIsCustomMonth] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Default to previous month (1 month earlier)
  const defaultMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<SalaryFormData>({
    defaultValues: {
      user_id: '',
      base_salary: 0,
      bonus: 0,
      deductions: 0,
      notes: '',
      // month and receipt_image are not in form, handled in payload
    }
  });

  const watchedBasicSalary = watch('base_salary');
  const watchedBonus = watch('bonus');
  const watchedDeductions = watch('deductions');
  const watchedMonth = selectedMonth;
  useEffect(() => {
    setSelectedMonth(defaultMonth);
  }, [defaultMonth]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setUsersLoading(true);
        const response = await userService.getUsers({ limit: 100 });
        setEmployees(response.data.users || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Calculate total salary automatically
  useEffect(() => {
    const total = Math.max(0, (watchedBasicSalary || 0) + (watchedBonus || 0) - (watchedDeductions || 0));
    setValue('total_payble', total);
  }, [watchedBasicSalary, watchedBonus, watchedDeductions, setValue]);

  const selectedEmployeeDetails = employees.find(emp => emp.id === selectedEmployee);

  // Debounced search effect for dropdown
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchTerm.length === 0) {
      setSearchDebounce('');
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      setSearchDebounce(searchTerm);
      setShowDropdown(searchTerm.length >= 3);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  const filteredEmployees = employees.filter(employee =>
    employee.first_name?.toLowerCase().includes(searchDebounce.toLowerCase()) ||
    employee.last_name?.toLowerCase().includes(searchDebounce.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchDebounce.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchDebounce.toLowerCase())
  );

  const handleEmployeeSelect = (employee: User) => {
    setSelectedEmployee(employee.id);
    setSearchTerm(`${employee.first_name} ${employee.last_name}`);
    setShowDropdown(false);
    setValue('user_id', employee.id);
    clearErrors('user_id');
    if (employee.base_salary !== undefined && employee.base_salary !== null) {
      setValue('base_salary', Number(employee.base_salary));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (selectedEmployee && value !== `${selectedEmployeeDetails?.first_name} ${selectedEmployeeDetails?.last_name}`) {
      setSelectedEmployee('');
      setValue('user_id', '');
    }
  };

  const clearSelection = () => {
    setSelectedEmployee('');
    setSearchTerm('');
    setShowDropdown(false);
    setValue('user_id', '');
    clearErrors('user_id');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('notes', { type: 'manual', message: 'File size must be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('notes', { type: 'manual', message: 'Please select a valid image file' });
        return;
      }
      setReceiptFile(file);
      clearErrors('notes');
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceiptFile = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    clearErrors('notes');
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedMonth(value);
  };
  const toggleCustomMonth = () => {
    setIsCustomMonth(!isCustomMonth);
    if (!isCustomMonth) {
      setSelectedMonth(defaultMonth);
    }
  };
  const generateQuickMonthOptions = () => {
    const options: { value: string; label: string; isPrevious?: boolean; isCurrent?: boolean }[] = [];
    const today = new Date();
    const prevMonth = subMonths(today, 1);
    options.push({
      value: format(prevMonth, 'yyyy-MM'),
      label: format(prevMonth, 'MMMM yyyy') + ' (Previous Month)',
      isPrevious: true
    });
    options.push({
      value: format(today, 'yyyy-MM'),
      label: format(today, 'MMMM yyyy') + ' (Current Month)',
      isCurrent: true
    });
    return options;
  };
  const quickMonthOptions = generateQuickMonthOptions();

  const onFormSubmit = async (data: SalaryFormData) => {
    try {
      if (!data.user_id) {
        setError('user_id', { type: 'required', message: 'Please select an employee' });
        return;
      }
      if (data.base_salary <= 0) {
        setError('base_salary', { type: 'min', message: 'Base salary must be greater than 0' });
        return;
      }
      const monthISO = `${selectedMonth}-01T00:00:00.000Z`;

      // Create FormData
      const formData = new FormData();
      formData.append('user_id', data.user_id);
      formData.append('base_salary', String(data.base_salary));
      formData.append('bonus', String(data.bonus || 0));
      formData.append('deductions', String(data.deductions || 0));
      formData.append('total_payble', String(data.total_payble || 0));
      formData.append('is_paid', String(data.is_paid));
      formData.append('notes', data.notes || '');
      formData.append('month', monthISO);

      if (receiptFile) {
        formData.append('receipt_image', receiptFile);
      }

      await salaryService.create(formData);

      navigate('/dashboard/salary');
    } catch (error) {
      console.error('Error creating salary record:', error);
    }
  };
  const getDisplayMonth = () => {
    if (watchedMonth) {
      return format(new Date(watchedMonth + '-01'), 'MMMM yyyy');
    }
    return format(new Date(defaultMonth + '-01'), 'MMMM yyyy');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/salary')}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Salaries
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Salary</h1>
            <p className="text-gray-600">Create a salary record for {getDisplayMonth()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Month Selection */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-purple-500" />
                Select Salary Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCustomMonth ? (
                // Quick month selection
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickMonthOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedMonth === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const [year, month] = option.value.split('-');
                          setSelectedMonth(option.value);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{option.label}</p>
                            <p className="text-sm text-gray-500">
                              {option.isPrevious ? 'Recommended for payroll' : 'Current month salary'}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedMonth === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMonth === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleCustomMonth}
                      className="text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Select Different Month
                    </Button>
                  </div>
                </div>
              ) : (
                // Custom month selection
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Custom Month Selection
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="h-12 flex-1"
                      max={currentMonth}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleCustomMonth}
                      className="h-12 px-4"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Selected: {getDisplayMonth()}
                  </p>
                </div>
              )}
              
              {/* Current selection display */}
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Salary Month: </span>
                  <span className="font-semibold">{getDisplayMonth()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                Select Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search employee by name, email, or role..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (!selectedEmployee && searchTerm.length >= 3) setShowDropdown(true);
                  }}
                  autoComplete="off"
                  readOnly={!!selectedEmployee} // <-- Lock input if employee is selected
                  className={`pl-12 h-12 text-base ${errors.user_id ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} ${showDropdown ? 'rounded-b-none' : ''} ${selectedEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  style={{ borderBottomLeftRadius: showDropdown ? 0 : undefined, borderBottomRightRadius: showDropdown ? 0 : undefined }}
                />
                {selectedEmployee && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {/* Dropdown */}
                {!selectedEmployee && showDropdown && (
                  <div
                    className="absolute left-0 right-0 z-50 mt-0 w-full bg-white border-x border-b border-gray-200 rounded-b-lg shadow-lg max-h-64 overflow-auto"
                    style={{ top: '100%' }}
                  >
                    {usersLoading ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        Loading employees...
                      </div>
                    ) : filteredEmployees.length > 0 ? (
                      <div className="py-2">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => handleEmployeeSelect(employee)}
                          >
                            {employee.picture ? (
                              <img
                                src={employee.picture}
                                alt={`${employee.first_name} ${employee.last_name}`}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {employee.first_name} {employee.last_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {employee.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        {searchDebounce.length < 3
                          ? "Type at least 3 characters to search"
                          : "No employees found"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {errors.user_id && (
                <p className="text-red-500 text-sm mt-2">{errors.user_id.message}</p>
              )}

              {/* Selected Employee Display */}
              {selectedEmployeeDetails && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    {selectedEmployeeDetails.picture ? (
                      <img
                        src={selectedEmployeeDetails.picture}
                        alt={`${selectedEmployeeDetails.first_name} ${selectedEmployeeDetails.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow-md">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedEmployeeDetails.first_name} {selectedEmployeeDetails.last_name}
                      </h4>
                      <p className="text-gray-600">{selectedEmployeeDetails.email}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        {selectedEmployeeDetails.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
                Salary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base Salary */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Base Salary <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">৳</span>
                    <Input
                      type="number"
                      placeholder="50,000"
                      {...register('base_salary', {
                        required: 'Base salary is required',
                        min: { value: 1, message: 'Base salary must be greater than 0' },
                        valueAsNumber: true
                      })}
                      className={`pl-8 h-12 text-base ${errors.base_salary ? 'border-red-300' : 'border-gray-200'} bg-gray-100 cursor-not-allowed`}
                      min="0"
                      step="100"
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                  {errors.base_salary && (
                    <p className="text-red-500 text-sm">{errors.base_salary.message}</p>
                  )}
                </div>

                {/* Bonus */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">
                    Bonus & Allowances
                  </Label>
                  <div className="relative">
                    <Plus className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                    <Input
                      type="number"
                      placeholder="5,000"
                      {...register('bonus', { 
                        min: { value: 0, message: 'Bonus cannot be negative' },
                        valueAsNumber: true
                      })}
                      className="pl-10 h-12 text-base border-gray-200"
                      min="0"
                      step="100"
                    />
                  </div>
                  {errors.bonus && (
                    <p className="text-red-500 text-sm">{errors.bonus.message}</p>
                  )}
                </div>

                {/* Deduction */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-700">
                    Deductions
                  </Label>
                  <div className="relative">
                    <Minus className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                    <Input
                      type="number"
                      placeholder="2,000"
                      {...register('deductions', {
                        min: { value: 0, message: 'Deductions cannot be negative' },
                        valueAsNumber: true
                      })}
                      className="pl-10 h-12 text-base border-gray-200"
                      min="0"
                      step="100"
                    />
                  </div>
                  {errors.deductions && (
                    <p className="text-red-500 text-sm">{errors.deductions.message}</p>
                  )}
                </div>
              </div>

              {/* Total Salary Display */}
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700 mb-2">Total Net Salary</p>
                  <div className="text-4xl font-bold text-green-800">
                    {formatCurrency(watch('total_payble') || 0)}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Base Salary + Bonus - Deductions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status & Receipt */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Status */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                  <Controller
                    name="is_paid"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value === true ? 'paid' : field.value === false ? 'unpaid' : ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          field.onChange(e.target.value === 'paid');
                        }}
                      >
                        <option value="" disabled>Select payment status</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </Select>
                    )}
                  />
                  {errors.is_paid && (
                    <p className="text-red-500 text-sm">{errors.is_paid.message}</p>
                  )}
                </div>

                {/* Receipt Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Receipt (Optional)</Label>
                  {!receiptPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload receipt</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeReceiptFile}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
                <Textarea
                  {...register('notes')}
                  placeholder="Any additional information about this salary record..."
                  rows={3}
                  className="resize-none border-gray-200"
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm">{errors.notes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/salary')}
              className="px-8 h-12"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 h-12 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Salary Record
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}