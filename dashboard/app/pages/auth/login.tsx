import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
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
import { Eye, EyeOff } from "lucide-react";
import type { LoginFormData } from '~/types/auth';
import { authService } from '~/services/httpServices/authService';
import { useNavigate } from "react-router";
import { useAppDispatch } from '~/redux/store/hooks';
import { checkAuthStatus } from '~/services/httpServices/authService';
import { AuthRedirect } from '~/hooks/auth/AuthRedirect';
import { StatusMessage } from '~/components/ui/StatusMessage';
import { useStatusMessage } from '~/utils/errorUtils';

import CoffeeClubLogo from "~/assets/logo.webp";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { statusMessage, setError, setSuccess, clearStatus } = useStatusMessage();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    clearStatus();
    try {
      const response = await authService.login(data);
      if (response.message) {
        setSuccess('Login successful! Redirecting...');
        await dispatch(checkAuthStatus());
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else if (response.error) {
        setError(response, response.message || 'Please fix the form errors and try again.');
      }
    } catch (error: any) {
      setError(error || 'Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthRedirect>
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-0 rounded-xl">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center gap-2">
              <img
                src={CoffeeClubLogo}
                alt="Coffee Club Logo"
                className="w-30 h-30"
                style={{ objectFit: "contain", background: "transparent" }}
              />
              <h2 className="text-3xl font-bold text-primary">Coffee Club Go</h2>
              <span className="text-sm text-gray-500">Fusion Chinese Restaurant</span>
            </div>
          </CardHeader>
          <CardContent>
            {statusMessage && (
              <StatusMessage
                status={statusMessage}
                onDismiss={clearStatus}
                className="mb-3"
              />
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  rules={{
                    required: "Username is required"
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email or phone"
                          autoFocus
                          {...field}
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="bg-gray-50"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium text-gray-700"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold py-2 rounded"
                >
                  Sign in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthRedirect>
  );
}