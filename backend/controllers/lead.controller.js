const Lead = require('../models/Lead');
const nodemailer = require('nodemailer');

function getTransporter() {
  // Use Gmail SMTP with app password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "tanjim11alam@gmail.com",
      pass: "heomrbwqxaaxhppj", // App password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    },
    secure: true,
    port: 465
  });
}

exports.createLead = async (req, res, next) => {
  try {
    const { name, phone, city, homeType, sourcePage, message, meta, productDetails } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check for duplicate leads (same phone number within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingLead = await Lead.findOne({
      phone: phone,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingLead) {
      console.log('⚠️ Duplicate lead detected for phone:', phone);
      return res.status(400).json({
        success: false,
        message: 'A lead with this phone number was submitted recently. Please wait a few minutes before submitting again.'
      });
    }

    // Create lead in database
    const lead = await Lead.create({ name, phone, city, homeType, sourcePage, message, meta, productDetails });

    console.log('✅ Lead created successfully:', lead._id);

    // Send email notification
    let emailSent = false;
    try {
      const transporter = getTransporter();
      const toEmail = "tanjim.seo@gmail.com";

      console.log('📧 Attempting to send email notification...');
      console.log('📧 To:', toEmail);
      console.log('📧 From:', "tanjim11alam@gmail.com");

      if (transporter && toEmail) {
        const subject = `New Interior Design Lead: ${name} (${phone}) - ${homeType || 'Interior Design'}`;

        // Format configuration data for better readability
        let configDetails = '';
        if (meta) {
          if (meta.kitchenConfig) {
            configDetails += `
              <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:10px 0;">
                <h3 style="color:#2c3e50;margin-top:0;">🍳 Kitchen Configuration</h3>
                ${meta.kitchenConfig.kitchenType ? `<p><strong>Kitchen Type:</strong> ${meta.kitchenConfig.kitchenType}</p>` : ''}
                ${meta.kitchenConfig.layout ? `<p><strong>Layout:</strong> ${meta.kitchenConfig.layout}</p>` : ''}
                ${meta.kitchenConfig.material ? `<p><strong>Material:</strong> ${meta.kitchenConfig.material}</p>` : ''}
                ${meta.kitchenConfig.suitableFor ? `<p><strong>Suitable For:</strong> ${meta.kitchenConfig.suitableFor}</p>` : ''}
                ${meta.kitchenConfig.style ? `<p><strong>Style:</strong> ${meta.kitchenConfig.style}</p>` : ''}
                ${meta.kitchenConfig.colorScheme ? `<p><strong>Color Scheme:</strong> ${meta.kitchenConfig.colorScheme}</p>` : ''}
                ${meta.kitchenConfig.budgetMin ? `<p><strong>Budget Range:</strong> ₹${meta.kitchenConfig.budgetMin} - ₹${meta.kitchenConfig.budgetMax || 'No limit'}</p>` : ''}
              </div>
            `;
          }

          if (meta.packageConfig) {
            configDetails += `
              <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:10px 0;">
                <h3 style="color:#2c3e50;margin-top:0;">📦 Package Configuration</h3>
                ${meta.packageConfig.kitchenType ? `<p><strong>Kitchen Type:</strong> ${meta.packageConfig.kitchenType}</p>` : ''}
                ${meta.packageConfig.wardrobe1Type ? `<p><strong>Wardrobe 1 Type:</strong> ${meta.packageConfig.wardrobe1Type}</p>` : ''}
                ${meta.packageConfig.wardrobe2Type ? `<p><strong>Wardrobe 2 Type:</strong> ${meta.packageConfig.wardrobe2Type}</p>` : ''}
                ${meta.packageConfig.wardrobeType ? `<p><strong>Wardrobe Type:</strong> ${meta.packageConfig.wardrobeType}</p>` : ''}
              </div>
            `;
          }

          if (meta.wardrobeConfig) {
            configDetails += `
              <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:10px 0;">
                <h3 style="color:#2c3e50;margin-top:0;">👔 Wardrobe Configuration</h3>
                ${meta.wardrobeConfig.type ? `<p><strong>Wardrobe Type:</strong> ${meta.wardrobeConfig.type}</p>` : ''}
                ${meta.wardrobeConfig.doors ? `<p><strong>Door Type:</strong> ${meta.wardrobeConfig.doors}</p>` : ''}
              </div>
            `;
          }

          if (meta.calculatorData) {
            configDetails += `
              <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:10px 0;">
                <h3 style="color:#2c3e50;margin-top:0;">🧮 Calculator Data</h3>
                ${meta.calculatorData.homeType ? `<p><strong>Home Type:</strong> ${meta.calculatorData.homeType}</p>` : ''}
                ${meta.calculatorData.rooms ? `<p><strong>Rooms:</strong> ${Array.isArray(meta.calculatorData.rooms) ? meta.calculatorData.rooms.join(', ') : meta.calculatorData.rooms}</p>` : ''}
                ${meta.calculatorData.area ? `<p><strong>Area:</strong> ${meta.calculatorData.area}</p>` : ''}
                ${meta.calculatorData.budget ? `<p><strong>Budget:</strong> ${meta.calculatorData.budget}</p>` : ''}
                ${meta.calculatorData.style ? `<p><strong>Style:</strong> ${meta.calculatorData.style}</p>` : ''}
                ${meta.calculatorData.timeline ? `<p><strong>Timeline:</strong> ${meta.calculatorData.timeline}</p>` : ''}
                ${meta.calculatorData.estimatedCost ? `<p><strong>Estimated Cost:</strong> ₹${meta.calculatorData.estimatedCost.totalCost?.toLocaleString() || 'Not calculated'}</p>` : ''}
              </div>
            `;
          }

          if (meta.selectedProduct) {
            configDetails += `
              <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:10px 0;border-left:4px solid #ffc107;">
                <h3 style="color:#856404;margin-top:0;">🛍️ Selected Product Details</h3>
                ${meta.selectedProduct.name ? `<p><strong>Product Name:</strong> ${meta.selectedProduct.name}</p>` : ''}
                ${meta.selectedProduct.basePrice ? `<p><strong>Price:</strong> ₹${meta.selectedProduct.basePrice.toLocaleString()}</p>` : ''}
                ${meta.selectedProduct.layout ? `<p><strong>Layout:</strong> ${meta.selectedProduct.layout.name || meta.selectedProduct.layout}</p>` : ''}
                ${meta.selectedProduct.materials ? `<p><strong>Materials:</strong> ${Array.isArray(meta.selectedProduct.materials) ? meta.selectedProduct.materials.map(m => m.material).join(', ') : meta.selectedProduct.materials}</p>` : ''}
                ${meta.selectedProduct.id ? `<p><strong>Product ID:</strong> ${meta.selectedProduct.id}</p>` : ''}
                ${meta.selectedProduct.image ? `<p><strong>Product Image:</strong> <a href="${meta.selectedProduct.image}" target="_blank">View Image</a></p>` : ''}
              </div>
            `;
          }

          if (meta.page) {
            configDetails += `<p><strong>Page Source:</strong> ${meta.page}</p>`;
          }
        }

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;font-size:24px;">🏠 New Interior Design Lead</h1>
              <p style="margin:5px 0 0 0;opacity:0.9;">Interior Design Inquiry Received</p>
            </div>
            
            <div style="padding:20px;background:#ffffff;">
              <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;">
                <h2 style="color:#2c3e50;margin-top:0;font-size:18px;">👤 Contact Information</h2>
                <p style="margin:8px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin:8px 0;"><strong>Phone:</strong> <a href="tel:${phone}" style="color:#3498db;text-decoration:none;">${phone}</a></p>
                ${city ? `<p style="margin:8px 0;"><strong>City:</strong> ${city}</p>` : ''}
                ${homeType ? `<p style="margin:8px 0;"><strong>Home Type:</strong> ${homeType}</p>` : ''}
                ${sourcePage ? `<p style="margin:8px 0;"><strong>Source Page:</strong> ${sourcePage}</p>` : ''}
                ${message ? `<p style="margin:8px 0;"><strong>Message:</strong> ${message}</p>` : ''}
              </div>
              
              ${configDetails}
              
              <div style="background:#e8f5e8;padding:15px;border-radius:8px;border-left:4px solid #27ae60;">
                <p style="margin:0;color:#27ae60;font-weight:bold;">✅ Lead Successfully Captured</p>
                <p style="margin:5px 0 0 0;color:#2c3e50;font-size:14px;">This lead has been saved to your admin panel and is ready for follow-up.</p>
              </div>
              
              <div style="text-align:center;margin-top:20px;padding-top:15px;border-top:1px solid #ecf0f1;">
                <p style="color:#7f8c8d;font-size:12px;margin:0;">Received on ${new Date().toLocaleString()}</p>
                <p style="color:#7f8c8d;font-size:12px;margin:5px 0 0 0;">HomeLine Team Interior Design System</p>
              </div>
            </div>
          </div>
        `;
        const mailOptions = {
          from: "tanjim11alam@gmail.com",
          to: toEmail,
          subject,
          html
        };

        console.log('📧 Sending email with options:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          htmlLength: mailOptions.html.length
        });

        const result = await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log('✅ Email notification sent successfully:', result.messageId);
      } else {
        console.log('⚠️ Email not sent - missing transporter or recipient email');
      }
    } catch (err) {
      console.error('❌ Email sending failed:', {
        message: err.message,
        code: err.code,
        response: err.response,
        stack: err.stack
      });
    }

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      lead: lead,
      emailSent: emailSent
    });
  } catch (err) {
    console.error('❌ Lead creation failed:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    next(err);
  }
};

exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'converted', 'closed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};


