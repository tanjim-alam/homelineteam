const nodemailer = require('nodemailer');

// Email transporter configuration
const createEmailTransporter = () => {
    const emailUser = process.env.EMAIL_USER || 'ahaanwell@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'qwbnsavibnsvdwma';

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

// Send lead notification email
const sendLeadNotificationEmail = async (lead) => {
    try {
        const transporter = createEmailTransporter();
        const emailTo = process.env.EMAIL_TO || 'tanjim.seo@gmail.com';

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
                        <p style="text-align: center; color: #666; margin: 10px 0 0 0;">HomeLine Teams</p>
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
                        <p>This email was automatically generated by HomeLine Teams Lead Management System</p>
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

module.exports = {
    createEmailTransporter,
    sendLeadNotificationEmail,
    sendOTPEmail
};
