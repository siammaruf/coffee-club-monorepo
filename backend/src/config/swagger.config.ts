import { SwaggerCustomOptions } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const BasicAuthOptions: SecuritySchemeObject = {
  type: 'http',
  scheme: 'basic',
  name: 'Basic Auth',
  description: 'Please enter your username and password to access the API.' 
}

const LogoutPlugin = () => ({
  statePlugins: {
    auth: {
      wrapActions: {
        logout: (internalLogoutAction: (keys: unknown) => unknown) => async (keys: unknown): Promise<unknown> => {
          try {
            const response = await fetch('/api/v1/auth/logout', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Logout response:', response.status);
            if (response.ok) {
              console.log('Cookies cleared successfully');
              localStorage.removeItem('authorized');
              console.log('Removed authorized from localStorage');
            } else {
              console.error('Failed to clear cookies');
            }
          } catch (error) {
            console.error('Error during logout:', error);
          }

          return internalLogoutAction(keys);
        }
      }
    }
  }
});

const LoginPlugin = () => ({
  statePlugins: {
    auth: {
      wrapActions: {
        authorize: (
          oriAction: (payload: Record<string, unknown>) => unknown
        ) => (
          payload: { 
            basic?: { value: { username: string; password: string } }, 
            basicAuth?: Record<string, unknown>
          } & Record<string, unknown>
        ): unknown => {

          console.log('Authorize payload:', payload);

          if (payload.basic) {
            const { username, password } = payload.basic.value;
            
            const handleLogin = async () => {
              try {
                const response = await fetch('/api/v1/auth/login', {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    username,
                    password,
                    rememberMe: true
                  })
                });

                if (response.ok) {
                  const data: unknown = await response.json();
                  console.log('Login successful:', data);
                  
                  const authData = { 
                    basic: { 
                      name: "basic", 
                      schema: {
                        type: "http",
                        scheme: "basic",
                        name: "Basic Auth",
                        description: "Please enter your username and password to access the API."
                      }, 
                      value: { 
                        username: username, 
                        password: password 
                      } 
                    } 
                  };

                  localStorage.setItem('authorized', JSON.stringify(authData));

                  return oriAction({
                    ...payload,
                    basicAuth: {
                      ...(payload.basicAuth as Record<string, unknown> ?? {}),
                      value: true
                    }
                  });
                } else {
                  console.error('Login failed:', response.status);
                  
                  let errorMessage = 'Login failed';
                  
                  try {
                    const errorData = await response.json() as unknown;
                    if (
                      errorData &&
                      typeof errorData === 'object' &&
                      'message' in errorData &&
                      typeof (errorData as { message?: unknown }).message === 'string'
                    ) {
                      errorMessage = (errorData as { message: string }).message;
                    }
                  } catch {
                    errorMessage = `Login failed with status: ${response.status}`;
                  }
                  
                  alert(errorMessage);
                  return oriAction(payload);
                }
              } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed: Network error');
                return oriAction(payload);
              }
            };
            
            void handleLogin();
            return null;
          }
          
          return oriAction(payload);
        }
      }
    }
  }
});

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
    plugins: [LoginPlugin, LogoutPlugin]
  },
};