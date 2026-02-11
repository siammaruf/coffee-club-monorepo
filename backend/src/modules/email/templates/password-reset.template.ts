export const passwordResetTemplate = (email: string, resetUrl: string, token: string): string => {
  const currentDate = new Date().toLocaleDateString();
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 1);
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #5c4033; margin-bottom: 5px;">Coffee Club</h1>
      <p style="color: #777; font-size: 14px;">Password Reset Request</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p>Hello,</p>
      <p>We received a request to reset the password for your Coffee Club account. Please use the link below to set a new password.</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; width: 40%;">Request Date</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${currentDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Account Email</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Reset Code</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0; font-family: monospace; font-size: 16px;">${token.substring(0, 6)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Expiration</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">This link will expire at ${expiryTime.toLocaleTimeString()} on ${expiryTime.toLocaleDateString()}</td>
      </tr>
    </table>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #5c4033; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Reset Password
      </a>
    </div>
    
    <div style="font-size: 13px; color: #777; border-top: 1px solid #e0e0e0; padding-top: 15px;">
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      <p>&copy; ${new Date().getFullYear()} Coffee Club. All rights reserved.</p>
    </div>
  </div>
  `;
};

