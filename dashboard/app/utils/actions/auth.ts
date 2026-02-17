import { z } from 'zod';
import { loginSchema } from '~/utils/validations/auth';
import type { LoginResponse } from '~/types/auth';

export async function loginAction(prevState: any, formData: FormData): Promise<LoginResponse> {
  'use server';
  try {
    loginSchema.parse(Object.fromEntries(formData));
    return { message: 'Login successful' };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue: z.ZodIssue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      return { error: JSON.stringify(fieldErrors) };
    }
    return { error: JSON.stringify({ form: 'Invalid credentials' }) };
  }
}