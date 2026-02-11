import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { authService } from "~/services/httpServices/authService";
import { StatusMessage } from "~/components/ui/StatusMessage";
import { useStatusMessage } from "~/utils/errorUtils";

type VerifyOTPFormData = {
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  digit5?: string;
  digit6?: string;
};

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const identity = searchParams.get('identity') || '';
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const { statusMessage, setError, setSuccess, clearStatus } = useStatusMessage();
  
  const showStatusMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
    } else {
      setError({ message });
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setCanResend(false);
    clearStatus();
    
    try {
      const response = await authService.forgotPassword(identity);
      if (response.success || response.status === 'success') {
        setSuccess('New OTP sent successfully!');
      } else {
        setError(response.message || 'Failed to resend OTP.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while resending OTP.');
    } finally {
      setResending(false);
    }
  };
  
  if (!identity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {statusMessage && (
          <StatusMessage 
            status={statusMessage} 
            onDismiss={clearStatus}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
          />
        )}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold text-destructive">Invalid Link</h2>
            <p className="text-muted-foreground mt-2">No identity provided in the verification link.</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth/forgot-password')} 
              className="w-full"
            >
              Go Back to Forgot Password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const form = useForm<VerifyOTPFormData>({
    defaultValues: {
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
    },
  });

  const focusNextInput = (currentIndex: number) => {
    const nextInput = document.querySelector(`input[name="digit${currentIndex + 2}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  };

  const focusPrevInput = (currentIndex: number) => {
    const prevInput = document.querySelector(`input[name="digit${currentIndex}"]`) as HTMLInputElement;
    if (prevInput) {
      prevInput.focus();
    }
  };

  const validateDigit = (value: string | undefined): true | string => {
    if (!value) return "Required";
    if (value.length !== 1) return "Must be 1 digit";
    if (!/^\d$/.test(value)) return "Must be a digit";
    return true;
  };

  const handleInputChange = (value: string, fieldName: keyof VerifyOTPFormData, index: number) => {
    if (value.length === 1 && /^\d$/.test(value)) {
      form.setValue(fieldName, value);
      if (index < 5) {
        focusNextInput(index);
      }
    } else if (value.length === 0) {
      form.setValue(fieldName, "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldName: keyof VerifyOTPFormData, index: number) => {
    if (e.key === 'Backspace' && !form.getValues(fieldName) && index > 0) {
      focusPrevInput(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const digits = pastedData.split('');
    
    const fieldNames: (keyof VerifyOTPFormData)[] = ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6'];
    
    fieldNames.forEach((fieldName, index) => {
      form.setValue(fieldName, digits[index] || '');
    });
    
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.querySelector(`input[name="digit${nextEmptyIndex + 1}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const formData = form.getValues();
    const otp = Object.values(formData).join('');
    
    if (otp.length < 4) {
      setError({ message: 'Please enter at least 4 digits' });
      return;
    }
    
    setLoading(true);
    clearStatus();
    setCanResend(false);
    
    try {
      const response = await authService.verifyOTP(identity, otp);
      
      if (response.status === 'success' || response.statusCode === 200){
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          navigate(`/auth/reset-password?identity=${response.token}`);
        }, 1000);
      } else {
        if (response.status === 'error' && response.canResend) {
          setCanResend(true);
        }
        setError(response.message || 'OTP verification failed.');
      }
    } catch (error: any) {
      if (error.canResend) {
        setCanResend(true);
      }
      showStatusMessage(error.message || 'An error occurred during OTP verification.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h2 className="text-3xl font-bold">Verify OTP</h2>
          <p className="text-muted-foreground mt-2">
            Enter the verification code sent to {identity}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Verification Code</FormLabel>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {(['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6'] as const).map((fieldName, index) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      rules={{
                        required: index < 4 ? "Required" : false,
                        validate: index < 4 ? validateDigit : undefined
                      }}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              className="text-center text-lg font-semibold h-12 w-12"
                              maxLength={1}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                                handleInputChange(value, fieldName, index);
                              }}
                              onKeyDown={(e) => {
                                handleKeyDown(e, fieldName, index);
                              }}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                
                {canResend && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full cursor-pointer" 
                    disabled={resending}
                    onClick={handleResendOTP}
                  >
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
          {statusMessage && (
            <StatusMessage 
              status={statusMessage} 
              onDismiss={clearStatus}
              className="mt-3 mb-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}