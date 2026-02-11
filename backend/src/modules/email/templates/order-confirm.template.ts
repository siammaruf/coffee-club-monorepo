export const orderConfirmationTemplate = (orderDetails: any): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #5c4033; margin-bottom: 5px;">Coffee Club</h1>
        <p style="color: #777; font-size: 14px;">Order Confirmation</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p>Thank you for your order!</p>
        <p>We're pleased to confirm that your order has been received and is being processed.</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; width: 40%;">Order Number</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${orderDetails.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Order Date</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${orderDetails.orderDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold;">Total Amount</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${orderDetails.totalAmount}</td>
        </tr>
      </table>
      
      <h3 style="color: #5c4033; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Order Items</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; text-align: left;">Item</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; text-align: center;">Quantity</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f5f5f5; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.items.map(item => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${item.name}</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">Subtotal</td>
            <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${orderDetails.subtotal}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">Tax</td>
            <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${orderDetails.tax}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">Total</td>
            <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${orderDetails.totalAmount}</td>
          </tr>
        </tfoot>
      </table>
      
      <div style="font-size: 13px; color: #777; border-top: 1px solid #e0e0e0; padding-top: 15px;">
        <p>If you have any questions about your order, please contact our customer service.</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} Coffee Club. All rights reserved.</p>
      </div>
    </div>
    `;
  };