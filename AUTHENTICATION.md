# Authentication System Documentation

## Overview

This document describes the comprehensive authentication system built for StripeForm, including user registration, login, profile management, and security features.

## Features

### 🔐 Authentication Methods
- **Email/Password**: Traditional email and password authentication
- **Google OAuth**: Sign in with Google account
- **GitHub OAuth**: Sign in with GitHub account
- **Anonymous Users**: Support for anonymous form creation

### 🛡️ Security Features
- Password strength validation
- Secure password reset via email
- Session management
- Protected routes
- User role management

### 👤 User Management
- User profile customization
- Subscription management
- Account preferences
- Security settings

## Architecture

### Core Components

#### 1. AuthProvider (`components/providers/AuthProvider.tsx`)
The central authentication context provider that manages:
- User authentication state
- Login/logout functionality
- Social authentication
- User profile updates

```typescript
import { useAuth } from '@/components/providers/AuthProvider'

const { user, signIn, signOut, isAuthenticated } = useAuth()
```

#### 2. ProtectedRoute (`components/auth/ProtectedRoute.tsx`)
Component wrapper for pages requiring authentication:

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'

<ProtectedRoute>
  <YourProtectedPage />
</ProtectedRoute>
```

#### 3. UserMenu (`components/auth/UserMenu.tsx`)
Navigation component displaying user info and account options.

#### 4. Authentication Hooks (`hooks/useAuthRedirect.ts`)
Custom hooks for authentication logic:

```typescript
import { useRequireAuth, useRedirectIfAuthenticated } from '@/hooks/useAuthRedirect'

// For protected pages
const { user, isLoading } = useRequireAuth()

// For login/register pages
const { shouldRender } = useRedirectIfAuthenticated('/dashboard')
```

## Pages

### 1. Login Page (`/login`)
- Email/password authentication
- Social login options (Google, GitHub)
- Password reset link
- Redirects authenticated users to dashboard

### 2. Register Page (`/register`)
- User registration with validation
- Password strength indicator
- Terms of service agreement
- Social registration options

### 3. Forgot Password (`/forgot-password`)
- Email-based password reset
- User-friendly error handling

### 4. Profile Page (`/profile`)
- **Profile Tab**: Personal information management
- **Security Tab**: Password, 2FA, session management
- **Subscription Tab**: Plan details and billing
- **Preferences Tab**: Timezone, language, account settings

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  avatar TEXT,
  bio TEXT,
  company TEXT,
  website TEXT,
  phone TEXT,
  timezone TEXT,
  language TEXT DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Protecting a Page
```typescript
// app/dashboard/page.tsx
'use client'

import { useRequireAuth } from '@/hooks/useAuthRedirect'

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth('/login')
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

### Using Authentication in Components
```typescript
import { useAuth } from '@/components/providers/AuthProvider'

function MyComponent() {
  const { user, signOut, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Hello, {user?.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Social Authentication
```typescript
import { useAuth } from '@/components/providers/AuthProvider'

function LoginButtons() {
  const { signInWithGoogle, signInWithGithub } = useAuth()
  
  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <button onClick={signInWithGithub}>Sign in with GitHub</button>
    </div>
  )
}
```

## Environment Variables

Required environment variables for authentication:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Note: Firebase emulators have been removed for production use
# Use real Firebase project configuration in production
```

## Security Considerations

### Password Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Real-time strength validation

### Session Management
- Secure token storage
- Automatic session refresh
- Secure logout functionality

### Data Protection
- Encrypted password storage
- Secure API endpoints
- Input validation and sanitization

## Error Handling

The authentication system includes comprehensive error handling:

```typescript
try {
  await signIn(email, password)
} catch (error: any) {
  // Handle specific error types
  if (error.code === 'auth/user-not-found') {
    setError('User not found. Please check your email.')
  } else if (error.code === 'auth/wrong-password') {
    setError('Incorrect password.')
  } else {
    setError('An error occurred. Please try again.')
  }
}
```

## Testing

### Unit Tests
```bash
npm run test:auth
```

### Integration Tests
```bash
npm run test:integration
```

## Troubleshooting

### Common Issues

1. **Authentication State Not Persisting**
   - Check Firebase configuration
   - Verify environment variables
   - Check browser console for errors

2. **Social Login Not Working**
   - Verify OAuth provider configuration
   - Check Firebase console settings
   - Ensure proper redirect URLs

3. **Profile Updates Failing**
   - Check database connection
   - Verify user permissions
   - Check form validation

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_AUTH_DEBUG=true
```

## Future Enhancements

- [ ] Two-factor authentication (TOTP)
- [ ] Biometric authentication
- [ ] Advanced role-based access control
- [ ] Audit logging
- [ ] Multi-session management
- [ ] Account linking (multiple providers)

## Support

For authentication-related issues:
1. Check the browser console for errors
2. Verify environment variables
3. Review Firebase console logs
4. Check Supabase dashboard
5. Contact the development team

---

*Last updated: December 2024*
