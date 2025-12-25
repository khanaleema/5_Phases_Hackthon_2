# Email Service Setup - Quick Instructions

## ✅ Resend Package Installed
The `resend` package has been installed successfully.

## 🔧 Setup Steps

### 1. Create `.env.local` file
Create a file named `.env.local` in the `frontend/` directory with this content:

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_CJn21idi_LgRTfMLxgthBzNRR3Hi2Fh9u
EMAIL_FROM=onboarding@resend.dev
```

### 2. Restart Your Server
**IMPORTANT:** After creating `.env.local`, you MUST restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
# or
npm run dev
```

### 3. Test
After restarting:
- Go to Settings → Security
- Click "Send Verification Email"
- Email will be sent to your email address via Resend

## ⚠️ Important Notes

1. **Server Restart Required**: Better Auth needs the server to restart to detect the email service configuration
2. **Environment Variables**: The `.env.local` file must be in the `frontend/` directory
3. **Email Address**: Emails will be sent to the email address of the logged-in user

## 🐛 Troubleshooting

If you still see "VERIFICATION_EMAIL_ISNT_ENABLED":
1. Make sure `.env.local` exists in `frontend/` directory
2. Make sure you restarted the server after creating `.env.local`
3. Check server console for any errors
4. Verify the Resend API key is correct

