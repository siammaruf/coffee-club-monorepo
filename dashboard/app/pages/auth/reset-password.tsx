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
import { useStatusMessage } from "~/utils/errorUtils";
import { StatusMessage } from "~/components/ui/StatusMessage";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const identity = searchParams.get('identity');
  
  const {
    statusMessage,
    setError,
    setSuccess,
    clearStatus,
    isSuccess
  } = useStatusMessage();
  
  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearStatus();
      
      if (token) {
        const result = await authService.newUserPassword(token, data.password);
        
        if (result.status === 'success' || result.statusCode === 200) {
          setSuccess(result, 'Password set successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else {
          setError(result, result.message || 'Failed to set password. Please try again.');
        }
      } else if (identity) {
        const result = await authService.resetPassword(identity, data.password);
        
        if (result.status === 'success' || result.statusCode === 200) {
          setSuccess(result, 'Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else {
          setError(result, result.message || 'Failed to reset password. Please try again.');
        }
      } else {
        setError({}, 'Invalid reset link. Please request a new password reset.');
      }
    } catch (error: any) {
      setError(error, 'An error occurred. Please try again.');
    }
  };

  if (!token && !identity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold text-destructive">Invalid Reset Link</h2>
            <p className="text-muted-foreground mt-2">This password reset link is invalid or has expired.</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="w-full"
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h2 className="text-3xl font-bold">
            {token ? 'Set Your Password' : 'Reset Password'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {token 
              ? 'Create a password for your new account'
              : 'Create a new password for your account'
            }
          </p>
        </CardHeader>
        <CardContent>
          <StatusMessage
            status={statusMessage}
            onDismiss={clearStatus}
            className="mb-3 mt-3"
          />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: (value) => {
                    const password = form.getValues("password");
                    return value === password || "Passwords don't match";
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSuccess}>
                {token ? 'Set Password' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}