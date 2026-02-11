export const welcomeUserTemplate = (email: string, firstName: string, resetUrl: string): string => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #5c4033; margin-bottom: 5px;">Welcome to Coffee Club!</h1>
      <p style="color: #777; font-size: 14px;">Account Created Successfully</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p>Hello ${firstName},</p>
      <p>Your Coffee Club account has been created successfully! To get started, please set your password using the link below.</p>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #5c4033; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Set Your Password
      </a>
    </div>
    
    <div style="font-size: 13px; color: #777; border-top: 1px solid #e0e0e0; padding-top: 15px;">
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't create this account, please contact our support team.</p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      <p>&copy; ${new Date().getFullYear()} Coffee Club. All rights reserved.</p>
    </div>
  </div>
  `;
};