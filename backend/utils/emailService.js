const nodemailer = require('nodemailer');

// Email transporter configuration
const createEmailTransporter = () => {
    const emailUser = process.env.EMAIL_USER || 'homeline042@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'qauccfkdbamlbaeg';

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

// Send lead notification email
const sendLeadNotificationEmail = async (lead, adminEmail) => {
    try {
        const transporter = createEmailTransporter();
        const emailTo = adminEmail || process.env.EMAIL_TO || 'homeline042@gmail.com';

        // Format the lead data for email
        const formatLeadData = (lead) => {
            let details = `
                <h3>Lead Information:</h3>
                <ul>
                    <li><strong>Name:</strong> ${lead.name}</li>
                    <li><strong>Phone:</strong> ${lead.phone}</li>
                    <li><strong>Email:</strong> ${lead.email || 'Not provided'}</li>
                    <li><strong>City:</strong> ${lead.city || 'Not provided'}</li>
                    <li><strong>Home Type:</strong> ${lead.homeType || 'Not provided'}</li>
                    <li><strong>Source Page:</strong> ${lead.sourcePage || 'Not specified'}</li>
                    <li><strong>Message:</strong> ${lead.message || 'No message provided'}</li>
                    <li><strong>Submitted:</strong> ${new Date(lead.createdAt).toLocaleString()}</li>
                </ul>
            `;

            // Add product details if available
            if (lead.productDetails) {
                details += `
                    <h3>Product Details:</h3>
                    <ul>
                        <li><strong>Product Name:</strong> ${lead.productDetails.name || 'Not specified'}</li>
                        <li><strong>Price:</strong> ₹${lead.productDetails.price || 'Not specified'}</li>
                        <li><strong>Category:</strong> ${lead.productDetails.category || 'Not specified'}</li>
                        <li><strong>Description:</strong> ${lead.productDetails.description || 'Not provided'}</li>
                    </ul>
                `;
            }

            // Add meta information if available (calculator data, package config, etc.)
            if (lead.meta) {
                details += `<h3>Additional Information:</h3>`;

                if (lead.meta.calculatorData) {
                    details += `
                        <h4>Calculator Data:</h4>
                        <ul>
                            <li><strong>Home Type:</strong> ${lead.meta.calculatorData.homeType || 'Not specified'}</li>
                            <li><strong>Rooms:</strong> ${lead.meta.calculatorData.rooms || 'Not specified'}</li>
                            <li><strong>Area:</strong> ${lead.meta.calculatorData.area || 'Not specified'} sq ft</li>
                            <li><strong>Budget:</strong> ₹${lead.meta.calculatorData.budget || 'Not specified'}</li>
                            <li><strong>Style:</strong> ${lead.meta.calculatorData.style || 'Not specified'}</li>
                            <li><strong>Timeline:</strong> ${lead.meta.calculatorData.timeline || 'Not specified'}</li>
                            <li><strong>Estimated Cost:</strong> ₹${lead.meta.calculatorData.estimatedCost || 'Not calculated'}</li>
                        </ul>
                    `;
                }

                if (lead.meta.packageConfig) {
                    details += `
                        <h4>Package Configuration:</h4>
                        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(lead.meta.packageConfig, null, 2)}</pre>
                    `;
                }

                if (lead.meta.kitchenConfig) {
                    details += `
                        <h4>Kitchen Configuration:</h4>
                        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(lead.meta.kitchenConfig, null, 2)}</pre>
                    `;
                }

                if (lead.meta.selectedProduct) {
                    details += `
                        <h4>Selected Product:</h4>
                        <ul>
                            <li><strong>Product ID:</strong> ${lead.meta.selectedProduct.id || 'Not specified'}</li>
                            <li><strong>Product Name:</strong> ${lead.meta.selectedProduct.name || 'Not specified'}</li>
                            <li><strong>Base Price:</strong> ₹${lead.meta.selectedProduct.basePrice || 'Not specified'}</li>
                        </ul>
                    `;
                }
            }

            return details;
        };

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@homelineteams.com',
            to: emailTo,
            subject: `New Interior Design Lead - ${lead.name} (${lead.sourcePage})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h1 style="color: #333; text-align: center; margin: 0;">🏠 New Interior Design Lead</h1>
                        <p style="text-align: center; color: #666; margin: 10px 0 0 0;">HomeLineTeam</p>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${formatLeadData(lead)}
                    </div>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 20px;">
                        <h4 style="color: #1976d2; margin: 0 0 10px 0;">📞 Next Steps:</h4>
                        <ul style="margin: 0; color: #333;">
                            <li>Contact the lead within 24 hours</li>
                            <li>Verify their requirements and budget</li>
                            <li>Schedule a design consultation if needed</li>
                            <li>Update lead status in admin panel</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>HomeLineTeam Lead Management System</p>
                        <p>Lead ID: ${lead._id}</p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

// Send OTP via email (existing function moved here for reusability)
const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: 'noreply@homelineteams.com',
            to: email,
            subject: 'Email Verification OTP - HomeLine Teams',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello!</p>
          <p>Thank you for registering with HomeLine Teams. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>HomeLine Teams</p>
        </div>
      `
        };

        const result = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

// Send order confirmation email to the customer
const sendOrderConfirmationEmail = async (order) => {
    const customerEmail = order.customer?.email;
    if (!customerEmail) return false;

    try {
        const transporter = createEmailTransporter();

        const isCOD = order.paymentMethod === 'cod';
        const isPaid = order.paymentStatus === 'paid';
        const orderNum = order.orderNumber || order._id.toString().slice(-8).toUpperCase();

        const itemsHtml = (order.items || []).map(item => `
            <tr>
                <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; color:#374151; font-size:14px;">
                    ${item.name}
                    ${item.selectedOptions && Object.keys(item.selectedOptions).length
                        ? `<br><span style="font-size:12px;color:#9ca3af;">${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>`
                        : ''}
                </td>
                <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:center; color:#6b7280; font-size:14px;">${item.quantity}</td>
                <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:right; color:#111827; font-weight:600; font-size:14px;">
                    ₹${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"HomelineTeam" <${process.env.EMAIL_FROM || 'noreply@homelineteams.com'}>`,
            to: customerEmail,
            subject: `Order Confirmed #${orderNum} — HomelineTeam`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#10b981,#059669);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;">
          <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="font-size:32px;">✓</span>
          </div>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">Order Confirmed!</h1>
          <p style="margin:8px 0 0 0;color:#d1fae5;font-size:15px;">Thank you, ${order.customer?.name?.split(' ')[0] || 'Customer'}! Your order is on its way.</p>
        </td></tr>

        <!-- Order number banner -->
        <tr><td style="background:#ffffff;padding:20px 32px;border-bottom:1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Order Number</p>
                <p style="margin:6px 0 0 0;font-size:22px;font-weight:800;color:#111827;">#${orderNum}</p>
              </td>
              <td style="text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Date</p>
                <p style="margin:6px 0 0 0;font-size:14px;font-weight:600;color:#374151;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </td>
              <td style="text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Payment</p>
                <span style="display:inline-block;margin-top:6px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;background:${isPaid ? '#d1fae5' : '#fef3c7'};color:${isPaid ? '#065f46' : '#92400e'};">
                  ${isPaid ? 'PAID' : 'PAY ON DELIVERY'}
                </span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Items table -->
        <tr><td style="background:#ffffff;padding:24px 32px;">
          <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:#111827;">Items Ordered</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
                <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </td></tr>

        <!-- Totals -->
        <tr><td style="background:#ffffff;padding:0 32px 24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0f0f0;padding-top:16px;">
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#6b7280;">Subtotal</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;color:#374151;">₹${(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#6b7280;">Shipping</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;color:#10b981;font-weight:600;">Free</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#6b7280;">Tax (GST 18%)</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;color:#374151;">₹${(order.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-top:2px solid #e5e7eb;">
              <td style="padding:12px 0 4px 0;font-size:18px;font-weight:800;color:#111827;">Total</td>
              <td style="padding:12px 0 4px 0;text-align:right;font-size:18px;font-weight:800;color:#059669;">₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Delivery + Payment info -->
        <tr><td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;width:50%;padding-right:16px;">
                <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Deliver To</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
                  ${order.customer?.name}<br>
                  ${order.customer?.address}<br>
                  ${order.customer?.city}, ${order.customer?.state} ${order.customer?.zip}
                </p>
              </td>
              <td style="vertical-align:top;width:50%;padding-left:16px;border-left:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Payment Method</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#374151;">${isCOD ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
                ${order.customer?.phone ? `<p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;">Phone: ${order.customer.phone}</p>` : ''}
                <p style="margin:8px 0 0 0;font-size:13px;color:#10b981;font-weight:600;">Est. Delivery: 3–5 Business Days</p>
              </td>
            </tr>
          </table>
        </td></tr>

        ${isCOD ? `
        <!-- COD reminder -->
        <tr><td style="background:#fffbeb;padding:16px 32px;border-left:4px solid #f59e0b;">
          <p style="margin:0;font-size:14px;color:#92400e;">
            <strong>Cash on Delivery Reminder:</strong> Please keep <strong>₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> ready when the order arrives.
          </p>
        </td></tr>` : ''}

        <!-- What's next -->
        <tr><td style="background:#eff6ff;padding:20px 32px;">
          <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#1e40af;">What happens next?</p>
          <p style="margin:0 0 6px 0;font-size:13px;color:#1e3a8a;">1. Our team will review and confirm your order</p>
          <p style="margin:0 0 6px 0;font-size:13px;color:#1e3a8a;">2. Your items will be carefully packed</p>
          <p style="margin:0;font-size:13px;color:#1e3a8a;">3. You'll receive a tracking link once shipped</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#111827;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 8px 0;color:#ffffff;font-size:16px;font-weight:700;">HomelineTeam</p>
          <p style="margin:0 0 16px 0;color:#9ca3af;font-size:13px;">For any questions, reply to this email or contact our support team.</p>
          <p style="margin:0;color:#4b5563;font-size:12px;">© ${new Date().getFullYear()} HomelineTeam. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Order confirmation email failed:', error.message);
        return false;
    }
};

// Admin notification: new order placed
const sendOrderAdminNotificationEmail = async (order, adminEmail) => {
    if (!adminEmail) return false;
    try {
        const transporter = createEmailTransporter();
        const orderNum = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
        const itemsHtml = (order.items || []).map(item =>
            `<li style="margin-bottom:6px;"><strong>${item.name}</strong> &times; ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}</li>`
        ).join('');

        await transporter.sendMail({
            from: `"HomelineTeam" <${process.env.EMAIL_FROM || 'noreply@homelineteams.com'}>`,
            to: adminEmail,
            subject: `New Order #${orderNum} — ₹${(order.total || 0).toLocaleString('en-IN')}`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#1e40af;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
    <h2 style="color:#fff;margin:0;">New Order Received</h2>
    <p style="color:#bfdbfe;margin:6px 0 0 0;">Order #${orderNum}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
    <h3 style="color:#111827;margin:0 0 12px 0;">Customer Details</h3>
    <p style="margin:4px 0;color:#374151;"><strong>Name:</strong> ${order.customer?.name || 'N/A'}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Phone:</strong> ${order.customer?.phone || 'N/A'}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Address:</strong> ${order.customer?.address || ''}, ${order.customer?.city || ''}, ${order.customer?.state || ''} ${order.customer?.zip || ''}</p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:16px 0;">
    <h3 style="color:#111827;margin:0 0 12px 0;">Items Ordered</h3>
    <ul style="padding-left:20px;color:#374151;">${itemsHtml}</ul>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:16px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="color:#6b7280;font-size:14px;">Subtotal</td><td style="text-align:right;color:#374151;">₹${(order.subtotal || 0).toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#6b7280;font-size:14px;">Tax</td><td style="text-align:right;color:#374151;">₹${(order.tax || 0).toLocaleString('en-IN')}</td></tr>
      <tr style="border-top:2px solid #e5e7eb;">
        <td style="color:#111827;font-weight:700;font-size:16px;padding-top:8px;">Total</td>
        <td style="text-align:right;color:#059669;font-weight:700;font-size:16px;padding-top:8px;">₹${(order.total || 0).toLocaleString('en-IN')}</td>
      </tr>
    </table>
    <p style="margin:16px 0 0 0;color:#374151;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'} — <strong>${order.paymentStatus || 'pending'}</strong></p>
  </div>
  <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;text-align:center;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">HomelineTeam Admin Notification — Order ID: ${order._id}</p>
  </div>
</div>`
        });
        return true;
    } catch (err) {
        console.error('Order admin notification failed:', err.message);
        return false;
    }
};

// Admin notification: new return/exchange request
const sendReturnAdminNotificationEmail = async (returnRequest, adminEmail) => {
    if (!adminEmail) return false;
    try {
        const transporter = createEmailTransporter();
        const isExchange = returnRequest.type === 'exchange';
        const itemsHtml = (returnRequest.items || []).map(item =>
            `<li style="margin-bottom:6px;">Product ID: <strong>${item.productId}</strong> &times; ${item.quantity} — Reason: ${item.reason || 'N/A'} (${item.condition || 'used'})</li>`
        ).join('');

        await transporter.sendMail({
            from: `"HomelineTeam" <${process.env.EMAIL_FROM || 'noreply@homelineteams.com'}>`,
            to: adminEmail,
            subject: `New ${isExchange ? 'Exchange' : 'Return'} Request — Order ${returnRequest.order}`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:${isExchange ? '#7c3aed' : '#dc2626'};padding:20px;border-radius:10px 10px 0 0;text-align:center;">
    <h2 style="color:#fff;margin:0;">New ${isExchange ? 'Exchange' : 'Return'} Request</h2>
    <p style="color:#fde8e8;margin:6px 0 0 0;">Request ID: ${returnRequest._id}</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
    <p style="margin:4px 0;color:#374151;"><strong>Type:</strong> ${returnRequest.type}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Order ID:</strong> ${returnRequest.order}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Status:</strong> ${returnRequest.status}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Customer Notes:</strong> ${returnRequest.customerNotes || 'None'}</p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:16px 0;">
    <h3 style="color:#111827;margin:0 0 12px 0;">Items</h3>
    <ul style="padding-left:20px;color:#374151;">${itemsHtml}</ul>
    ${returnRequest.bankAccount?.accountNumber ? `
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:16px 0;">
    <h3 style="color:#111827;margin:0 0 12px 0;">Bank Details</h3>
    <p style="margin:4px 0;color:#374151;"><strong>Account Holder:</strong> ${returnRequest.bankAccount.accountHolderName}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Bank:</strong> ${returnRequest.bankAccount.bankName}</p>
    <p style="margin:4px 0;color:#374151;"><strong>Account:</strong> ${returnRequest.bankAccount.accountNumber}</p>
    <p style="margin:4px 0;color:#374151;"><strong>IFSC:</strong> ${returnRequest.bankAccount.ifscCode}</p>` : ''}
  </div>
  <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;text-align:center;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">HomelineTeam Admin Notification — Return ID: ${returnRequest._id}</p>
  </div>
</div>`
        });
        return true;
    } catch (err) {
        console.error('Return admin notification failed:', err.message);
        return false;
    }
};

module.exports = {
    createEmailTransporter,
    sendLeadNotificationEmail,
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendOrderAdminNotificationEmail,
    sendReturnAdminNotificationEmail,
};
