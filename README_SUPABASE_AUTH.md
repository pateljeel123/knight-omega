# Supabase Authentication Integration Guide

This guide provides step-by-step instructions to integrate Supabase authentication with Google/GitHub OAuth and Email/Phone OTP support into your existing application.

## 🚀 Quick Start

### 1. Environment Setup

#### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email/SMS Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

#### Frontend (web/.env)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### 2. Database Setup

Run the SQL migration script in your Supabase SQL editor:
```sql
-- Copy contents from migrations/001_create_supabase_auth_schema.sql
```

### 3. Install Dependencies

#### Backend
```bash
go get github.com/supabase-community/supabase-go
```

#### Frontend
```bash
cd web
npm install @supabase/supabase-js
```

### 4. Configure Supabase

#### Enable OAuth Providers
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth and configure with your client ID/secret
3. Enable GitHub OAuth and configure with your client ID/secret

#### Configure Email Templates
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize the email templates for OTP

## 📁 File Structure

```
├── service/
│   └── supabase_service.go          # Supabase service layer
├── controller/
│   ├── otp.go                      # OTP controller
│   └── auth_providers.go           # Auth providers controller
├── web/
│   ├── src/
│   │   ├── context/
│   │   │   └── EnhancedAuthContext.js  # React auth context
│   │   └── components/
│   │       └── auth/
│   │           └── EnhancedLoginForm.js  # Enhanced login form
├── migrations/
│   └── 001_create_supabase_auth_schema.sql  # Database schema
├── router/
│   └── supabase_auth_router.go     # New auth routes
├── .env                            # Backend environment variables
└── web/.env                        # Frontend environment variables
```

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/send-email-otp` - Send OTP to email
- `POST /api/auth/send-phone-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and authenticate
- `GET /api/auth/providers` - Get available auth providers
- `GET /api/auth/callback/:provider` - OAuth callback

### Frontend Components
- `EnhancedAuthContext` - React context for auth state
- `EnhancedLoginForm` - Multi-method login form

## 🎯 Features Implemented

### ✅ Authentication Methods
1. **Google OAuth** - One-click Google login
2. **GitHub OAuth** - One-click GitHub login
3. **Email OTP** - 6-digit code sent to email
4. **Phone OTP** - 6-digit code sent to phone
5. **Traditional Password** - Email/password login

### ✅ User Experience
- **Progressive Enhancement** - Works with or without JavaScript
- **Responsive Design** - Mobile-friendly interface
- **Internationalization** - Ready for i18n
- **Error Handling** - Comprehensive error messages
- **Loading States** - Visual feedback during auth

### ✅ Security Features
- **Rate Limiting** - Prevents brute force attacks
- **OTP Expiration** - 5-minute OTP validity
- **Session Management** - Secure session handling
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request handling

## 🔄 Migration from MySQL

### Hybrid Mode
Set `HYBRID_MODE=true` to run both MySQL and Supabase auth simultaneously during migration.

### Migration Script
```bash
# Run migration
go run cmd/migrate/main.go

# Verify migration
go run cmd/verify/main.go
```

## 🧪 Testing

### Test All Authentication Methods
1. **Google OAuth**: Click "Sign in with Google"
2. **GitHub OAuth**: Click "Sign in with GitHub"
3. **Email OTP**: Enter email → Get code → Verify
4. **Phone OTP**: Enter phone → Get code → Verify
5. **Password**: Enter email/password → Login

### Test Edge Cases
- Invalid OTP codes
- Expired OTP codes
- Rate limiting
- Network errors
- Session expiration

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/api/auth/status
```

### Metrics
- Authentication success/failure rates
- OTP delivery rates
- OAuth provider usage
- Session duration

## 🚨 Troubleshooting

### Common Issues

#### "Supabase connection failed"
- Check `SUPABASE_URL` and `SUPABASE_KEY` in .env
- Verify network connectivity to Supabase

#### "OAuth not working"
- Check OAuth client IDs/secrets
- Verify redirect URLs in OAuth provider settings

#### "Email OTP not sending"
- Check SMTP configuration
- Verify email service credentials

#### "Phone OTP not working"
- Check Twilio configuration
- Verify phone number format

## 📝 Next Steps

1. **Configure OAuth Providers** - Set up Google/GitHub OAuth
2. **Set up Email Service** - Configure SMTP for OTP
3. **Set up SMS Service** - Configure Twilio for phone OTP
4. **Test All Features** - Verify all authentication methods
5. **Deploy to Production** - Update environment variables
6. **Monitor Usage** - Set up monitoring and alerts

## 🔄 Rollback Plan

If you need to rollback to MySQL auth:
1. Set `USE_SUPABASE_AUTH=false` in .env
2. Restart the application
3. Users can continue using MySQL authentication

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Test with the provided examples
4. Check logs for detailed error messages