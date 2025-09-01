# 🛠️ Local Development Setup Guide

## **Overview**

This guide helps you set up a proper local development environment for PokerPlace using Supabase CLI with Mailpit for email testing, avoiding the bounce issues you encountered with the production Supabase instance.

## **Why Use Local Development?**

- **No Email Bounce Issues**: Emails are captured locally by Mailpit
- **Faster Development**: No network latency for database operations
- **Safe Testing**: No risk of affecting production data
- **Cost Effective**: No usage limits on local development

## **Prerequisites**

- Node.js (v18 or higher)
- Docker Desktop (for Supabase local development)
- Git

## **Step 1: Install Supabase CLI**

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

## **Step 2: Initialize Supabase in Your Project**

```bash
# Navigate to your project directory
cd pokerplace

# Initialize Supabase (if not already done)
supabase init

# This creates a supabase/ directory with configuration files
```

## **Step 3: Start Local Supabase Services**

```bash
# Start all Supabase services locally
supabase start

# This will start:
# - PostgreSQL database
# - Supabase Auth
# - Edge Functions
# - Mailpit (email testing)
# - Studio (database management UI)
```

## **Step 4: Access Local Services**

After running `supabase start`, you'll see output like this:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322:5432/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Key URLs:**
- **Studio (Database UI)**: http://127.0.0.1:54323
- **Mailpit (Email Testing)**: http://127.0.0.1:54324
- **API**: http://127.0.0.1:54321

## **Step 5: Update Environment Variables**

Create a `.env.local` file for local development:

```bash
# Local Development Environment Variables
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Use the `anon key` from the `supabase start` output.

## **Step 6: Set Up Database Schema**

```bash
# Apply your database schema to local instance
supabase db reset

# Or if you have migrations:
supabase db push
```

## **Step 7: Test Email Functionality**

### **Using Mailpit for Email Testing**

1. **Start your Next.js development server**:
   ```bash
   npm run dev
   ```

2. **Open Mailpit**: http://127.0.0.1:54324

3. **Test user registration**:
   - Go to your app's signup page
   - Use any email address (e.g., `test@example.com`)
   - Submit the form
   - Check Mailpit to see the captured email

4. **View captured emails**:
   - All emails sent by your local Supabase instance appear in Mailpit
   - Click on any email to view its content
   - No emails are actually sent to real addresses

## **Step 8: Database Management**

### **Using Supabase Studio (Local)**

1. **Open Studio**: http://127.0.0.1:54323
2. **Login**: Use the credentials from `supabase start` output
3. **Manage**: Tables, users, policies, etc.

### **Using SQL Editor**

```bash
# Open SQL editor
supabase db studio

# Or run SQL commands directly
supabase db reset
```

## **Step 9: Stop Local Services**

```bash
# Stop all local Supabase services
supabase stop

# Or stop and remove all data
supabase stop --no-backup
```

## **Development Workflow**

### **Daily Development**

1. **Start local services**:
   ```bash
   supabase start
   ```

2. **Start your app**:
   ```bash
   npm run dev
   ```

3. **Test features**:
   - Use any email addresses for testing
   - Check Mailpit for captured emails
   - Use Studio for database management

4. **Stop services when done**:
   ```bash
   supabase stop
   ```

### **Database Changes**

```bash
# Create a new migration
supabase migration new add_new_table

# Apply migrations
supabase db push

# Reset database (careful - deletes all data)
supabase db reset
```

## **Troubleshooting**

### **Common Issues**

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :54321
   lsof -i :54322
   lsof -i :54323
   lsof -i :54324
   ```

2. **Docker issues**:
   ```bash
   # Restart Docker Desktop
   # Then restart Supabase
   supabase stop
   supabase start
   ```

3. **Database connection issues**:
   ```bash
   # Reset the database
   supabase db reset
   ```

### **Useful Commands**

```bash
# Check status of services
supabase status

# View logs
supabase logs

# Update Supabase CLI
npm update -g supabase

# Get help
supabase --help
```

## **Production vs Local Development**

| Feature | Local Development | Production |
|---------|------------------|------------|
| Email Testing | Mailpit (localhost:54324) | Real email providers |
| Database | Local PostgreSQL | Supabase Cloud |
| Auth | Local Supabase Auth | Supabase Cloud Auth |
| API | Local API | Supabase Cloud API |
| Studio | Local Studio | Supabase Cloud Studio |

## **Benefits of This Setup**

✅ **No email bounce issues** - All emails captured locally  
✅ **Faster development** - No network latency  
✅ **Safe testing** - No production data risk  
✅ **Cost effective** - No usage limits  
✅ **Full control** - Complete local environment  

## **Next Steps**

1. **Set up local development environment**
2. **Test all email functionality locally**
3. **Develop features without bounce concerns**
4. **Use production Supabase only for final testing**

---

**Last Updated**: December 2024  
**Status**: READY - Local development setup










