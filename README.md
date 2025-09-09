# StripeForm - Professional Form Building Platform

A comprehensive form building platform with integrated payments, user management, and analytics.

## Features

- **User Management**: Complete user authentication and authorization system
- **Form Builder**: Drag-and-drop form creation with custom fields
- **Brand Kit**: Customizable branding and styling for forms
- **Payment Integration**: Stripe payment processing
- **Analytics**: Form performance tracking and insights
- **Admin Dashboard**: Comprehensive system administration
- **API**: RESTful API for integrations
- **Webhooks**: Real-time event notifications

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Stripe integration
- **Validation**: Zod schema validation

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account (for payment processing)

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stripeform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   ```
   
   Edit `.env.local` with your development configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/stripeform"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Stripe (use test keys for development)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

### Production Setup

1. **Environment Configuration**
   ```bash
   cp env.template .env.local
   ```
   
   Fill in your production values:
   ```env
   # Firebase (Production)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_live_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   
   # Supabase (Production)
   NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_live_supabase_key
   
   # Stripe (Production - use live keys)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   
   # Database (Production)
   DATABASE_URL="postgresql://username:password@host:port/stripeform"
   
   # Security
   JWT_SECRET="your-production-jwt-secret"
   NEXTAUTH_SECRET="your-production-session-secret"
   ```

2. **Remove Development Dependencies**
   - The project has been configured to automatically use production services
   - Firebase emulators have been removed
   - Mock data has been replaced with real database queries
   - Demo fallback values have been removed

3. **Database Migration**
   ```bash
   npm run db:migrate
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

4. **Set up the database**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Apply migrations
   npm run db:migrate
   
   # Seed with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name stripeform-postgres \
  -e POSTGRES_DB=stripeform \
  -e POSTGRES_USER=stripeform \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL would be:
# postgresql://stripeform:password@localhost:5432/stripeform
```

### Manual Setup

1. Create a PostgreSQL database
2. Update your `.env.local` with the connection string
3. Run migrations: `npm run db:migrate`

## Database Commands

```bash
# Generate new migration files
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema changes directly (development only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Forms
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form details
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Admin
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user status

## Default Users

After running the seed script, you'll have these default users:

- **Super Admin**: `admin@stripeform.com` / `admin123`
- **Admin**: `admin@example.com` / `admin123`
- **Demo User**: `demo@example.com` / `demo123`

## Project Structure

```
stripeform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── forms/         # Form management
│   │   └── admin/         # Admin endpoints
│   ├── brand-kit/         # Brand kit page
│   └── dashboard/         # User dashboard
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── brand-kit/         # Brand kit components
│   ├── dashboard/         # Dashboard components
│   ├── form-builder/      # Form builder components
│   └── ui/                # Reusable UI components
├── lib/                    # Utility libraries
│   ├── auth/              # Authentication service
│   ├── db/                # Database configuration
│   └── services/          # Business logic services
├── types/                  # TypeScript type definitions
└── drizzle/                # Database migrations
```

## Development

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Database Development

```bash
# Start Drizzle Studio
npm run db:studio

# Generate new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL` - Production PostgreSQL connection
- `JWT_SECRET` - Strong secret key
- `STRIPE_SECRET_KEY` - Production Stripe key
- `NEXT_PUBLIC_APP_URL` - Your domain

### Database Migrations

```bash
# Generate production migration
npm run db:generate

# Apply to production database
npm run db:migrate
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Email notifications
- [ ] Advanced form validation
- [ ] Form templates
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced security features 