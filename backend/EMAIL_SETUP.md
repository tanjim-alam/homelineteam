# Email Configuration Setup

## Environment Variables

To fix email issues in production, set these environment variables:

```bash
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=tanjim11alam@gmail.com
EMAIL_PASS=heomrbwqxaaxhppj
EMAIL_FROM=tanjim11alam@gmail.com
EMAIL_TO=tanjim.seo@gmail.com
```

## For Production (Railway/Vercel)

Add these environment variables in your production deployment:

1. **Railway Dashboard:**
   - Go to your project settings
   - Add environment variables
   - Set all the EMAIL_* variables above

2. **Vercel Dashboard:**
   - Go to your project settings
   - Add environment variables
   - Set all the EMAIL_* variables above

## Testing Email

You can test the email configuration by calling:
```
GET https://your-backend-url/api/leads/test-email
```

This will send a test email and show the configuration being used.

## Lead Email Notifications

The system now automatically sends email notifications for all interior design leads to the configured email address. The email includes:

- Lead contact information (name, phone, email, city)
- Source page and message
- Product details (if applicable)
- Calculator data (for interior design calculator leads)
- Package configuration (for package page leads)
- Kitchen configuration (for kitchen page leads)
- Selected product information

### Email Configuration for Lead Notifications

The lead notification emails are sent to the email address specified in the `EMAIL_TO` environment variable. If not set, it defaults to `tanjim.seo@gmail.com`.

Make sure to set this environment variable in your production deployment:
```bash
EMAIL_TO=your-lead-notification-email@domain.com
```

## Gmail App Password

Make sure you're using a Gmail App Password, not your regular password:
1. Enable 2-factor authentication on Gmail
2. Generate an App Password for "Mail"
3. Use that App Password as EMAIL_PASS

## Troubleshooting

If emails still don't work in production:
1. Check the server logs for email errors
2. Verify environment variables are set correctly
3. Test with the `/test-email` endpoint
4. Check Gmail security settings
