# Supabase Direct Auth Integration - Quick Setup

## 🚀 3-Step Setup

### 1. Configure Supabase
```bash
# In Supabase Dashboard:
# 1. Go to Authentication → Providers
# 2. Enable Google OAuth → Add your Google Client ID/Secret
# 3. Enable GitHub OAuth → Add your GitHub Client ID/Secret
# 4. Configure Email Templates (optional)
```

### 2. Environment Variables

#### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

#### Frontend (web/.env)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### 3. Install Dependencies

#### Frontend
```bash
cd web
npm install @supabase/supabase-js
```

## 📁 Files to Use

### **Frontend Components**
- `web/src/context/SupabaseAuthContext.js` - Clean auth context
- `web/src/components/auth/SupabaseLoginForm.js` - Direct Supabase login

### **Environment Files**
- `web/.env` - Frontend configuration
- `.env` - Backend configuration (if needed)

## 🎯 Features (Using Supabase Directly)

### **Authentication Methods**
1. **Google OAuth** - One-click Google login
2. **GitHub OAuth** - One-click GitHub login  
3. **Email + Password** - Traditional email/password
4. **Magic Link** - Passwordless email login
5. **Email Verification** - Built-in email verification

### **Built-in Features**
- ✅ **User Management** - Supabase handles everything
- ✅ **Session Management** - JWT tokens automatically
- ✅ **Password Reset** - Built-in password reset
- ✅ **Email Verification** - Automatic email verification
- ✅ **Security** - Row Level Security, JWT tokens
- ✅ **OAuth** - Google/GitHub OAuth integration

## 🔄 Migration from MySQL

### **Step 1: Export Users**
```bash
# Export existing users from MySQL
mysqldump -u root -p your_database users --where="status=1" --no-create-info --skip-add-drop-table > users.sql
```

### **Step 2: Import to Supabase**
```javascript
// Use Supabase Admin API to import users
const importUsers = async () => {
  const users = await fetch('/api/export-users').then(r => r.json());
  
  for (const user of users) {
    await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password, // Hashed password
      email_confirm: true,
      user_metadata: {
        username: user.username,
        display_name: user.display_name
      }
    });
  }
};
```

## 🧪 Testing

### **Test All Methods**
1. **Google OAuth**: Click "Sign in with Google"
2. **GitHub OAuth**: Click "Sign in with GitHub"
3. **Email + Password**: Enter email/password → Login
4. **Magic Link**: Enter email → Get magic link → Click link

### **Test Migration**
1. **Export Users**: Run the export script
2. **Import Users**: Run the import script
3. **Verify**: Check users in Supabase dashboard

## 📊 Monitoring

### **Supabase Dashboard**
- Go to Supabase Dashboard → Authentication → Users
- Monitor active sessions
- View OAuth provider usage

### **Health Check**
```bash
curl http://localhost:3000/api/auth/status
```

## 🚨 Troubleshooting

### **"Supabase connection failed"**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
- Verify network connectivity to Supabase

### **"OAuth not working"**
- Check OAuth client IDs/secrets in Supabase dashboard
- Verify redirect URLs in OAuth provider settings

### **"User import failed"**
- Check password hash format compatibility
- Verify email addresses are valid

## 📝 Next Steps

1. **Configure Supabase** - Set up OAuth providers
2. **Update Environment** - Replace placeholder values
3. **Test Features** - Test all authentication methods
4. **Deploy** - Ready for production

## 🎯 Key Benefits of This Approach

- **Zero Custom Auth Logic** - Supabase handles everything
- **Built-in Security** - JWTs, RLS, rate limiting
- **OAuth Integration** - Google/GitHub OAuth built-in
- **Password Reset** - Automatic password reset flow
- **Email Verification** - Built-in email verification
- **User Management** - Complete user management dashboard

## 🔄 Rollback Plan

If you need to rollback to MySQL:
1. Set `USE_SUPABASE_AUTH=false` in .env
2. Restart the application
3. Users can continue using MySQL authentication

**Ready to deploy!** 🚀