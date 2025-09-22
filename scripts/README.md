# Database Cleanup Scripts

This directory contains scripts for cleaning up test users and their data from the database.

## 🚨 Important Warning

These scripts will **PERMANENTLY DELETE** data from your database. Always backup your database before running these scripts in production.

## 📋 Available Scripts

### 1. Check Test Users (`db:check`)

**Purpose**: Identifies test users and shows their data without deleting anything.

**Usage**:
```bash
npm run db:check
```

**What it does**:
- Searches for users matching test patterns (emails like `test@`, `demo@`, etc.)
- Shows detailed information about each test user
- Displays statistics about their data (forms, submissions, drafts, etc.)
- Lists all forms created by test users
- **Does NOT delete anything**

### 2. Cleanup Test Users (`db:cleanup`)

**Purpose**: Permanently deletes test users and all their associated data.

**Usage**:
```bash
npm run db:cleanup
```

**What it does**:
- Finds all test users (same patterns as check script)
- Shows statistics before deletion
- Waits 5 seconds for you to cancel (Ctrl+C)
- Deletes all data in this order:
  1. Form submissions
  2. Form fields
  3. Forms
  4. Form drafts
  5. Payment intents
  6. User tracking data
  7. Firebase auth mapping
  8. User profiles
  9. Users

## 🔍 Test User Patterns

The scripts identify test users based on these patterns:

### Email Patterns
- `test@`, `@test.`, `@example.`, `@demo.`
- `demo@`, `admin@`, `user@`, `temp@`
- `fake@`, `dummy@`, `sample@`, `tester@`
- `dev@`, `development@`, `staging@`, `preview@`
- `beta@`, `alpha@`, `qa@`, `quality@`
- `automation@`, `bot@`, `script@`, `automated@`
- `system@`, `service@`, `api@`, `webhook@`
- `integration@`, `sandbox@`, `mock@`
- `placeholder@`, `example@`, `sample@`
- `template@`, `default@`, `backup@`
- `restore@`, `migration@`, `setup@`
- `install@`, `config@`, `settings@`
- `local@`, `localhost@`, `127.0.0.1@`
- `0.0.0.0@`, `::1@`

### Name Patterns
- `Test User`, `Demo User`, `Admin User`
- `Sample User`, `Example User`, `Fake User`
- `Dummy User`, `Temporary User`
- `Development User`, `Staging User`
- `Preview User`, `Beta User`, `Alpha User`
- `QA User`, `Quality User`, `Automation User`
- `Bot User`, `Script User`, `Automated User`
- `System User`, `Service User`, `API User`
- `Webhook User`, `Integration User`
- `Sandbox User`, `Mock User`
- `Placeholder User`, `Template User`
- `Default User`, `Backup User`
- `Restore User`, `Migration User`
- `Setup User`, `Install User`
- `Config User`, `Settings User`
- `Local User`, `Localhost User`

## 🛡️ Safety Features

1. **Preview First**: Always run `db:check` before `db:cleanup`
2. **5-Second Delay**: Cleanup script waits 5 seconds before proceeding
3. **Detailed Logging**: Shows exactly what's being deleted
4. **Error Handling**: Continues with other users if one fails
5. **Foreign Key Safety**: Deletes in correct order to respect constraints

## 📊 Example Output

### Check Script Output
```
🔍 Checking database for test users and their data...

📊 Found 3 potential test users:

👤 User: test@example.com
   Name: Test User
   ID: abc123
   Role: user
   Status: active
   Created: 2024-01-01T00:00:00Z
   Last Login: 2024-01-02T00:00:00Z
   📊 Data Summary:
      - Forms: 5
      - Submissions: 23
      - Drafts: 2
      - Payments: 0
      - Tracking Records: 1
   📝 Forms:
      - "Contact Form" (contact-form) - published - 15 submissions
      - "Survey" (survey) - draft - 0 submissions

📈 TOTAL SUMMARY:
   👥 Users: 3
   📝 Forms: 12
   📊 Submissions: 45
   📄 Drafts: 5
   💳 Payments: 0
   📍 Tracking Records: 3

⚠️  WARNING: This data would be PERMANENTLY DELETED if you run the cleanup script!
💡 To delete this data, run: npm run db:cleanup
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure your database user has DELETE permissions
2. **Foreign Key Errors**: The script handles this by deleting in the correct order
3. **Connection Issues**: Check your `DATABASE_URL` environment variable

### Manual Cleanup

If the script fails, you can manually delete users:

```sql
-- Delete a specific user and all their data
DELETE FROM form_submissions WHERE user_id = 'user-id';
DELETE FROM form_fields WHERE form_id IN (SELECT id FROM forms WHERE user_id = 'user-id');
DELETE FROM forms WHERE user_id = 'user-id';
DELETE FROM form_drafts WHERE user_id = 'user-id';
DELETE FROM payment_intents WHERE user_id = 'user-id';
DELETE FROM user_tracking WHERE firebase_uid = 'user-id';
DELETE FROM firebase_auth_mapping WHERE firebase_uid = 'user-id';
DELETE FROM user_profiles WHERE user_id = 'user-id';
DELETE FROM users WHERE id = 'user-id';
```

## 📝 Notes

- The scripts use Drizzle ORM for database operations
- All operations are wrapped in try-catch blocks for error handling
- The cleanup script provides a 5-second window to cancel
- Progress is logged for each step of the deletion process
- The script respects foreign key constraints by deleting in the correct order
