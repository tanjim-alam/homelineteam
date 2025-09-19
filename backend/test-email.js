const nodemailer = require('nodemailer');
const config = require('./config/' + (process.env.NODE_ENV || 'development'));

async function testEmail() {
    console.log('🧪 Testing Email Configuration...');
    console.log('📧 Environment:', process.env.NODE_ENV || 'development');
    console.log('📧 Config loaded:', !!config);
    console.log('📧 EMAIL_SERVICE:', config.EMAIL_SERVICE);
    console.log('📧 EMAIL_USER:', config.EMAIL_USER);
    console.log('📧 EMAIL_PASS exists:', !!config.EMAIL_PASS);
    console.log('📧 EMAIL_FROM:', config.EMAIL_FROM);
    console.log('📧 EMAIL_TO:', config.EMAIL_TO);

    try {
        const emailService = config.EMAIL_SERVICE || 'gmail';
        let transporter;

        // If using smtp.gmail.com, use host instead of service
        if (emailService === 'smtp.gmail.com') {
            transporter = nodemailer.createTransporter({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        } else {
            // Use service for gmail, outlook, etc.
            transporter = nodemailer.createTransporter({
                service: emailService,
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                },
                secure: true,
                port: 465
            });
        }

        console.log('📧 Transporter created successfully');

        const testMailOptions = {
            from: config.EMAIL_FROM,
            to: config.EMAIL_TO,
            subject: 'Test Email from HomeLine Backend',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Email Test</h2>
          <p>This is a test email from your HomeLine backend.</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you receive this email, your SMTP configuration is working correctly!</p>
        </div>
      `
        };

        console.log('📧 Sending test email...');
        const result = await transporter.sendMail(testMailOptions);

        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Response:', result.response);

    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('📧 Error message:', error.message);
        console.error('📧 Error code:', error.code);
        console.error('📧 Error response:', error.response);
        console.error('📧 Full error:', error);
    }
}

testEmail();
