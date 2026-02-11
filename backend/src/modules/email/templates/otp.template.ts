export function otpTemplate(email: string, otp: string): string {
  const currentDate = new Date().toLocaleDateString();
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10);
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #5c4033; margin-bottom: 5px;">Coffee Club</h1>
      <p style="color: #777; font-size: 14px;">One-Time Password (OTP)</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p>Hello,</p>
      <p>You have requested a One-Time Password (OTP) for your Coffee Club account. Please use the code below to proceed with your password reset.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #5c4033; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
        <p style="margin: 0; font-size: 14px; margin-bottom: 10px;">Your OTP Code</p>
        <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
      </div>
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
        <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Valid Until</td>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${expiryTime.toLocaleTimeString()} on ${expiryTime.toLocaleDateString()}</td>
      </tr>
    </table>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Security Notice:</p>
      <p style="margin: 5px 0 0 0; color: #856404;">This OTP is valid for 10 minutes only. Do not share this code with anyone.</p>
    </div>
    
    <div style="font-size: 13px; color: #777; border-top: 1px solid #e0e0e0; padding-top: 15px;">
      <p>If you didn't request this OTP, please ignore this email or contact support if you have concerns.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      <p>&copy; ${new Date().getFullYear()} Coffee Club. All rights reserved.</p>
    </div>
  </div>
  `;
}