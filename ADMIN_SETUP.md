# Admin User Setup Guide

This guide will help you set up an admin user for your StripeForm platform so you can test the backend functionality.

## Prerequisites

- Firebase project configured
- Supabase project configured
- Environment variables set up

## Step 1: Create Admin User in Firebase

### Option A: Using the Script (Recommended)

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Run the admin user creation script**:
   ```bash
   node create-admin-user.js
   ```

3. **Copy the Firebase UID** that gets displayed in the console.

### Option B: Manual Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Users
4. Click "Add User"
5. Enter:
   - Email: `admin@stripeform.com`
   - Password: `Help1234`
6. Copy the generated UID

## Step 2: Update Database Schema

1. **Go to your Supabase project**:
   - Navigate to [supabase.com](https://supabase.com)
   - Select your project
   - Go to SQL Editor

2. **Run the SQL script**:
   - Copy the contents of `setup-admin-user.sql`
   - Replace `'admin-firebase-uid'` with the actual Firebase UID from Step 1
   - Execute the script

## Step 3: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the admin page**:
   - Go to `http://localhost:3000/admin`
   - Sign in with:
     - Email: `admin@stripeform.com`
     - Password: `Help1234`

3. **Test the admin dashboard**:
   - The page should load and display system statistics
   - Check the browser console for any errors
   - Test the different time period filters (day, week, month, year)

## Step 4: Test Backend API

1. **Test the admin API endpoint**:
   ```bash
   curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
        http://localhost:3000/api/admin/dashboard
   ```

2. **Test cache health endpoint**:
   ```bash
   curl http://localhost:3000/api/cache/health
   ```

## Troubleshooting

### Common Issues

1. **"Authentication required" error**:
   - Make sure you're signed in with the admin account
   - Check that the Firebase UID in the database matches your user

2. **"Admin access required" error**:
   - Verify the user has `role: 'admin'` in the database
   - Check the RLS policies are correctly set up

3. **Database connection errors**:
   - Verify your Supabase connection string
   - Check that all tables exist in the `api` schema

4. **Missing data in admin dashboard**:
   - The dashboard shows real data from your database
   - If tables are empty, the stats will show 0

### Debug Steps

1. **Check Firebase Authentication**:
   - Verify the user exists in Firebase Console
   - Check that the UID matches what's in your database

2. **Check Database**:
   - Run this query in Supabase SQL Editor:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'admin@stripeform.com';
   ```

3. **Check RLS Policies**:
   - Verify the admin policies are active:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

4. **Check API Logs**:
   - Look at your terminal running `npm run dev`
   - Check browser console for errors

## Security Notes

⚠️ **Important**: This setup is for development/testing only!

- The password `Help1234` is weak and should be changed in production
- The admin role grants full access to all data
- In production, implement proper JWT verification
- Consider implementing role-based access control (RBAC)

## Next Steps

Once the admin user is working:

1. **Test form creation and management**
2. **Test user management features**
3. **Test analytics and reporting**
4. **Test Stripe integration**
5. **Implement proper JWT verification for production**

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal running your dev server
3. Verify all environment variables are set correctly
4. Ensure your Firebase and Supabase projects are properly configured

---

**Happy testing! 🚀**







