import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
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
import { useState } from "react";
import { authService } from "~/services/httpServices/authService";
import { useStatusMessage } from "~/utils/errorUtils";
import { StatusMessage } from "~/components/ui/StatusMessage";

type ForgotPasswordFormData = {
  identity: string;
};

const validateIdentity = (value: string): true | string => {
  if (!value) return "Identity is required";
  
  // Check if it's an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) {
    return true; 
  }
  
  // Check if it's a mobile number
  if (value.length < 10) return "Mobile number must be at least 10 digits";
  if (value.length > 15) return "Mobile number cannot exceed 15 digits";
  if (!/^\d+$/.test(value)) return "Mobile number must contain only digits";
  
  return true; 
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    statusMessage,
    setError,
    setSuccess,
    clearStatus,
    isSuccess
  } = useStatusMessage();
  
  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      identity: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (loading) return;
    
    setLoading(true);
    clearStatus();
    
    try {
      const response = await authService.forgotPassword(data.identity);
      
      if (response.status === 'success' || response.statusCode === 200) {
        setSuccess(response.message || 'OTP sent successfully!');
        setTimeout(() => {
          navigate(`/auth/verify-otp?identity=${data.identity}`);
        }, 1500);
      } else {
        setError(response, "Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      setError(error, "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-muted-foreground mt-2">Enter your mobile number or email address to receive a verification code</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identity"
                rules={{
                  required: "Identity is required",
                  validate: validateIdentity
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number or Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isSuccess}
              >
                {loading ? "Sending..." : isSuccess ? "OTP Sent!" : "Send Verification Code"}
              </Button>
              
              {statusMessage && (
                <StatusMessage 
                  status={statusMessage} 
                  onDismiss={clearStatus}
                />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}