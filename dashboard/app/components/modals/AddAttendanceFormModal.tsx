import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Search, X } from "lucide-react";
import type { AddAttendanceFormProps, AttendanceFormData } from "~/types/attendance";
import type { RootState } from "~/redux/store/rootReducer";
import type { User as UserType } from "~/types/user";
import { userService } from "~/services/httpServices/userService";
import { AttendanceStatus } from "~/pages/dashboard/attendance/enum/attendanc-status";
import { attendanceService } from "~/services/httpServices/attendanceService";

const statusOptions = [
  { value: AttendanceStatus.PRESENT, label: 'Present', color: 'text-green-600' },
  { value: AttendanceStatus.LATE, label: 'Late', color: 'text-yellow-600' },
  { value: AttendanceStatus.ABSENT, label: 'Absent', color: 'text-red-600' },
  { value: AttendanceStatus.HALF_DAY, label: 'Half Day', color: 'text-orange-600' },
  { value: AttendanceStatus.ON_LEAVE, label: 'On Leave', color: 'text-blue-600' },
];

export default function AddAttendanceFormModal({
  open,
  onClose,
  onSubmit,
  isLoading = false
}: AddAttendanceFormProps) {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [SelectedStatus, setSelectedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [SelectedEmployee, setSelectedEmployee] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [workHours, setWorkHours] = useState<number>(8);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<AttendanceFormData>({
    defaultValues: {
      attendance_date: format(new Date(), 'yyyy-MM-dd'),
      status: AttendanceStatus.PRESENT,
      work_hours: 8,
      overtime_hours: 0,
    }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!open) return;
      
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
  }, [open]);

  const filteredEmployees = searchTerm.length >= 3 
    ? employees.filter(employee =>
        employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee?.phone && employee.phone.includes(searchTerm))
      )
    : [];

  const SelectedEmployeeDetails = employees.find(emp => emp.id === SelectedEmployee);

  const validateForm = (data: AttendanceFormData): boolean => {
    let isValid = true;
    clearErrors();

    if (!data.user_id) {
      setError('user_id', { type: 'required', message: 'Please Select an employee' });
      isValid = false;
    }

    if (!data.attendance_date) {
      setError('attendance_date', { type: 'required', message: 'Date is required' });
      isValid = false;
    }

    if (!data.status) {
      setError('status', { type: 'required', message: 'Please Select a status' });
      isValid = false;
    }

    if (data.work_hours && (data.work_hours < 0 || data.work_hours > 24)) {
      setError('work_hours', { type: 'range', message: 'Work hours must be between 0 and 24' });
      isValid = false;
    }

    if (data.overtime_hours && (data.overtime_hours < 0 || data.overtime_hours > 24)) {
      setError('overtime_hours', { type: 'range', message: 'Overtime hours must be between 0 and 24' });
      isValid = false;
    }

    if (data.check_in && data.check_out) {
      const checkInTimeObj = new Date(`2000-01-01T${data.check_in}`);
      const checkOutTimeObj = new Date(`2000-01-01T${data.check_out}`);
      
      if (checkOutTimeObj <= checkInTimeObj) {
        setError('check_out', { type: 'invalid', message: 'Check-out time must be after check-in time' });
        isValid = false;
      }
    }

    return isValid;
  };

  const calculateWorkHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    
    const [inHours, inMinutes] = checkIn.split(':').map(Number);
    const [outHours, outMinutes] = checkOut.split(':').map(Number);
    
    const inTime = inHours * 60 + inMinutes;
    const outTime = outHours * 60 + outMinutes;
    
    if (outTime <= inTime) return 0;
    
    const totalMinutes = outTime - inTime;
    return totalMinutes / 60;
  };

  useEffect(() => {
    if (checkInTime && checkOutTime) {
      const hours = calculateWorkHours(checkInTime, checkOutTime);
      const formattedHours = parseFloat(hours.toFixed(2));
      setWorkHours(formattedHours);
      setValue('work_hours', formattedHours);
      
      const overtime = Math.max(0, formattedHours - 8);
      const formattedOvertime = parseFloat(overtime.toFixed(2));
      setOvertimeHours(formattedOvertime);
      setValue('overtime_hours', formattedOvertime);
    }
  }, [checkInTime, checkOutTime, setValue]);

  useEffect(() => {
    if (SelectedStatus === AttendanceStatus.ABSENT || SelectedStatus === AttendanceStatus.ON_LEAVE) {
      setCheckInTime('');
      setCheckOutTime('');
      setWorkHours(0);
      setOvertimeHours(0);
      setValue('check_in', undefined);
      setValue('check_out', undefined);
      setValue('work_hours', 0);
      setValue('overtime_hours', 0);
    }
  }, [SelectedStatus, setValue]);

  const handleFormSubmit = async (data: AttendanceFormData) => {
    try {
      if (!validateForm(data)) {
        return;
      }

      if (!isAuthenticated || !user) {
        console.error('User not authenticated');
        return;
      }

      const convertToDateTime = (time: string, date: string): string => {
        return `${date}T${time}:00.000Z`;
      };

      const finalData: AttendanceFormData = {
        user_id: SelectedEmployee,
        attendance_date: data.attendance_date,
        check_in: checkInTime ? convertToDateTime(checkInTime, data.attendance_date) : undefined,
        check_out: checkOutTime ? convertToDateTime(checkOutTime, data.attendance_date) : undefined,
        status: SelectedStatus,
        work_hours: workHours,
        overtime_hours: overtimeHours,
        notes: data.notes || undefined,
        is_approved: true,
        approved_by: user.id,
      };
      
      await onSubmit(finalData);
      handleClose();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('root', { 
          type: 'server', 
          message: error.response.data?.message || 'Invalid attendance data. Please check your inputs.' 
        });
      } else if (error.response?.status === 409) {
        setError('attendance_date', { 
          type: 'conflict', 
          message: 'Attendance record already exists for this employee on this date.' 
        });
      } else if (error.response?.status === 404) {
        setError('user_id', { 
          type: 'notFound', 
          message: 'Selected employee not found.' 
        });
      } else {
        setError('root', { 
          type: 'server', 
          message: 'Failed to create attendance record. Please try again.' 
        });
      }
    }
  };

  const handleClose = () => {
    reset();
    setSelectedStatus(AttendanceStatus.PRESENT);
    setSelectedEmployee('');
    setCheckInTime('');
    setCheckOutTime('');
    setWorkHours(8);
    setOvertimeHours(0);
    setSearchTerm('');
    setShowDropdown(false);
    setEmployees([]);
    clearErrors();
    onClose();
  };

  const handleEmployeeSelect = (employee: UserType) => {
    setSelectedEmployee(employee.id);
    setSearchTerm(`${employee.first_name} ${employee.last_name}`);
    setShowDropdown(false);
    setValue('user_id', employee.id);
    clearErrors('user_id');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    setShowDropdown(true);
    if (SelectedEmployee && value !== `${SelectedEmployeeDetails?.first_name} ${SelectedEmployeeDetails?.last_name}`) {
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

  const handleStatusChange = (value: string) => {
    const status = value as AttendanceStatus;
    setSelectedStatus(status);
    setValue('status', status);
    clearErrors('status');
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCheckInTime(value);
    setValue('check_in', value || undefined);
    clearErrors('check_in');
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCheckOutTime(value);
    setValue('check_out', value || undefined);
    clearErrors('check_out');
  };

  const handleWorkHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const formattedValue = parseFloat(value.toFixed(2));
    setWorkHours(formattedValue);
    setValue('work_hours', formattedValue);
    clearErrors('work_hours');
    
    const overtime = Math.max(0, formattedValue - 8);
    const formattedOvertime = parseFloat(overtime.toFixed(2));
    setOvertimeHours(formattedOvertime);
    setValue('overtime_hours', formattedOvertime);
  };

  const handleOvertimeHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const formattedValue = parseFloat(value.toFixed(2));
    setOvertimeHours(formattedValue);
    setValue('overtime_hours', formattedValue);
    clearErrors('overtime_hours');
  };

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add Attendance Record
          </DialogTitle>
          <DialogDescription>
            Create a new attendance record for an employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search employee by name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-8 pr-8"
                />
                {SelectedEmployee && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={clearSelection}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {showDropdown && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg">
                  {usersLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Loading employees...</div>
                  ) : searchTerm.length < 3 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Type at least 3 characters to search employees.
                    </div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 flex items-center gap-3"
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        {employee.picture ? (
                          <img
                            src={employee.picture}
                            alt={`${employee.first_name} ${employee.last_name}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.email} • {employee.phone}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No employees found matching your search.
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.user_id && (
              <p className="text-sm text-red-600">{errors.user_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendance_date">Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="attendance_date"
                type="date"
                className="pl-8 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                {...register('attendance_date', { 
                  required: 'Date is required',
                  onChange: () => clearErrors('attendance_date')
                })}
              />
            </div>
            {errors.attendance_date && (
              <p className="text-sm text-red-600">{errors.attendance_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={SelectedStatus} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select status</option>
              {statusOptions.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {SelectedStatus !== AttendanceStatus.ABSENT && SelectedStatus !== AttendanceStatus.ON_LEAVE && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check In</Label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="check_in"
                    type="time"
                    className="pl-8 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={checkInTime}
                    onChange={handleCheckInChange}
                  />
                </div>
                {errors.check_in && (
                  <p className="text-sm text-red-600">{errors.check_in.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="check_out">Check Out</Label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="check_out"
                    type="time"
                    className="pl-8 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={checkOutTime}
                    onChange={handleCheckOutChange}
                  />
                </div>
                {errors.check_out && (
                  <p className="text-sm text-red-600">{errors.check_out.message}</p>
                )}
              </div>
            </div>
          )}

          {SelectedStatus !== AttendanceStatus.ABSENT && SelectedStatus !== AttendanceStatus.ON_LEAVE && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work_hours">Work Hours</Label>
                <Input
                  id="work_hours"
                  type="number"
                  step="any"
                  min="0"
                  max="24"
                  value={workHours}
                  onChange={handleWorkHoursChange}
                />
                {errors.work_hours && (
                  <p className="text-sm text-red-600">{errors.work_hours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_hours">Overtime Hours</Label>
                <Input
                  id="overtime_hours"
                  type="number"
                  step="any"
                  min="0"
                  max="24"
                  value={overtimeHours}
                  onChange={handleOvertimeHoursChange}
                />
                {errors.overtime_hours && (
                  <p className="text-sm text-red-600">{errors.overtime_hours.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] cursor-pointer"
            >
              {isSubmitting ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}