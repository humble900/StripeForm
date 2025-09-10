# Admin User Setup Guide

This guide explains how to securely manage admin users in your StripeForm platform.

## ⚠️ Security Notice

**No hardcoded admin credentials are provided for security reasons.** Admin accounts must be created through the secure role management system.

## Prerequisites

- Supabase project configured
- Environment variables set up
- At least one superadmin account (created manually in database)

## Step 1: Create Initial Superadmin

The initial superadmin must be created directly in the database:

1. **Go to your Supabase project**:
   - Navigate to [supabase.com](https://supabase.com)
   - Select your project
   - Go to SQL Editor

2. **Run the SQL script**:
   ```sql
   INSERT INTO public.users (
       id,
       email,
       password_hash,
       first_name,
       last_name,
       role,
       status,
       email_verified,
       created_at,
       updated_at
   ) VALUES (
       'your-superadmin-id',
       'your-superadmin@email.com',
       crypt('your-secure-password', gen_salt('bf')),
       'Super',
       'Admin',
       'super_admin',
       'active',
       true,
       NOW(),
       NOW()
   );
   ```

## Step 2: Create Admin Users Securely

Once you have a superadmin account, you can create admin users through the API:

1. **Login as superadmin**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"your-superadmin@email.com","password":"your-secure-password"}'
   ```

2. **Create admin user**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/users \
        -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","firstName":"Admin","lastName":"User","role":"admin"}'
   ```

## Step 3: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the admin page**:
   - Go to `http://localhost:3000/admin`
   - Sign in with your admin credentials

3. **Test the admin dashboard**:
   - The page should load and display system statistics
   - Check the browser console for any errors
   - Test the different time period filters (day, week, month, year)

## Step 4: Role Management

### Available Roles:
- **user**: Regular users (default)
- **admin**: Can access admin dashboard and manage content
- **super_admin**: Can create admin users and manage roles

### API Endpoints:
- `GET /api/admin/users` - List all users (superadmin only)
- `POST /api/admin/users` - Create new user (superadmin only)
- `PUT /api/admin/users` - Update user role (superadmin only)

## Security Features:
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







