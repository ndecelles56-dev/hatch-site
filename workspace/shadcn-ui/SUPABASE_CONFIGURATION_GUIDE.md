# 🔧 Supabase Configuration Guide for Password Reset

## ⚠️ Critical Issue: Localhost Redirect Problem

If password reset emails are redirecting to `localhost:3000` (which can't be reached in production), you need to update your Supabase project configuration.

## 📋 Step-by-Step Fix

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **hatch-real-estate**
3. Navigate to **Authentication** → **URL Configuration**

### 2. Update Site URL
**Current Problem**: Site URL is set to `http://localhost:3000`

**Fix**:
```
Site URL: https://your-production-domain.com
```
Replace `your-production-domain.com` with your actual deployed domain.

### 3. Update Redirect URLs
**Current Problem**: Redirect URLs only include localhost

**Fix - Add these URLs**:
```
https://your-production-domain.com/auth/callback
https://your-production-domain.com/auth/callback?type=recovery
http://localhost:3000/auth/callback (keep for development)
http://localhost:3000/auth/callback?type=recovery (keep for development)
```

### 4. Environment Variables Setup

#### For Production Deployment:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

#### For Local Development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Platform-Specific Instructions

### Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the production environment variables above
4. Redeploy your application

### Netlify Deployment:
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the production environment variables above
4. Trigger a new deploy

### Other Platforms:
Set the environment variables in your hosting platform's configuration panel.

## 🔍 Testing the Fix

### Before Configuration:
- Password reset email links go to `http://localhost:3000/...`
- Links are unreachable in production
- Users get "site can't be reached" error

### After Configuration:
- Password reset email links go to `https://your-domain.com/...`
- Links work correctly in production
- Users can successfully reset passwords

## 📧 Email Template Verification

After updating the configuration:

1. **Test Password Reset**:
   - Go to your deployed site
   - Click "Forgot Password"
   - Enter your email
   - Check the reset email

2. **Verify Email Content**:
   - The reset link should contain your production domain
   - NOT `localhost:3000`

3. **Test the Flow**:
   - Click the reset link in the email
   - Should load your production site with password reset form
   - Enter new password and confirm it works

## 🆘 Troubleshooting

### Issue: Still getting localhost URLs
**Solution**: 
- Double-check Supabase dashboard Site URL setting
- Ensure environment variables are set correctly in deployment platform
- Redeploy the application after making changes

### Issue: "Redirect URL not allowed" error
**Solution**:
- Add your production callback URLs to Supabase redirect URLs list
- Include both `/auth/callback` and `/auth/callback?type=recovery`

### Issue: Password reset form not showing
**Solution**:
- Check browser console for errors
- Verify the URL contains recovery tokens
- Ensure the AuthCallback component is handling URL fragments correctly

## 📞 Support

If you continue to have issues:
1. Check the browser console for error messages
2. Verify all URLs in Supabase dashboard match your production domain
3. Confirm environment variables are set in your deployment platform
4. Test the flow end-to-end after each configuration change

---

**🎯 Key Point**: The main issue is Supabase configuration, not code. Update your Supabase project settings first, then redeploy with correct environment variables.