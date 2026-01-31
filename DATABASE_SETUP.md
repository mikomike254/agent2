# Database Setup Instructions

## Quick Start: Apply Migrations via Supabase Dashboard

Since the `DATABASE_URL` requires a password, the easiest way to apply migrations is through the Supabase Dashboard:

### Method 1: Supabase SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/sql)
2. Click on your project
3. Navigate to **SQL Editor** in the left sidebar
4. For each migration file, copy and paste the entire contents:
   
   **Run in this order:**
   - `supabase/migrations/011_enhanced_job_project_system.sql`
   - `supabase/migrations/012_rls_policies.sql`
   - `supabase/migrations/013_helper_functions.sql`

5. Click **Run** for each file
6. Verify success messages appear

---

### Method 2: Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

### Method 3: Update DATABASE_URL and Run Script

1. Get your database password from Supabase Dashboard:
   - Go to **Settings** → **Database**
   - Copy the password under **Database Password**

2. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR_ACTUAL_PASSWORD]@...
   ```

3. Run migration:
   ```bash
   npx tsx scripts/run_migration.ts
   ```

---

## What Gets Created

The migrations will create:

### Tables
- `clients` - Client extended profiles
- `messages` - Project chat system
- `project_participants` - Project team tracking
- `job_views` - Analytics for job views
- `profile_views` - Analytics for profile views
- `notifications` - User notification system

### Enhancements to Existing Tables
- `leads` - Added category, requirements, project_id
- `projects` - Added commissioner_id, source, timeline
- `users` - Added bio, avatar_url, verified_at
- `commissioners` - Added company_name, bio, website

### Indexes (Performance)
- Fast job board queries
- Optimized project lookups
- Quick message retrieval
- Efficient notification queries

### Row Level Security
- Secure access control on all tables
- Users can only see their data
- Public job board access
- Project participant restrictions

### Helper Functions
- `create_notification()` - Easy notification creation
- `get_unread_notification_count()` - Count unread notifications
- `mark_all_notifications_read()` - Mark all as read
- `get_project_statistics()` - Project analytics

### Automatic Triggers
- Auto-notify on new messages
- Auto-notify when jobs posted
- Auto-notify on project creation
- Auto-update timestamps

---

## Verify Success

After running migrations, test in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

---

## Troubleshooting

**Error: "relation already exists"**
- Tables already exist. This is fine, migrations use `IF NOT EXISTS`

**Error: "column already exists"**
- Columns already exist. This is fine, migrations use `ADD COLUMN IF NOT EXISTS`

**Error: "permission denied"**
- You need to be the database owner
- Use Supabase Dashboard SQL Editor which has full permissions

**Error: "function does not exist: auth.uid()"**
- RLS policies need Supabase Auth enabled
- This is automatic in Supabase projects

---

## Next Steps

Once migrations are applied:

1. ✅ Test job posting: Create a job via `/api/jobs`
2. ✅ Test profiles: Visit `/profile/[userId]`
3. ✅ Test projects: Convert a job to a project
4. ✅ Test messaging: Send messages in project chat
5. ✅ Check notifications: View auto-generated notifications

The platform will be fully operational!
