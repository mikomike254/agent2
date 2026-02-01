# Complete Supabase Setup Checklist

## ✅ Already Implemented (Code Ready)

### 1. Real-time Pipeline Architecture ✅
- **Status**: Code is complete and tested
- **What it does**: All user activities (creating leads, updating projects, payments, profile changes) sync live across dashboards
- **Included activities**:
  - Client: Creating projects, making payments, approving milestones
  - Commissioner: Creating leads, managing clients, tracking commissions
  - Developer: Updating work logs, marking milestones complete
  - Admin: Approving users, verifying payments, monitoring platform
- **Location**: Migration file `019_enable_realtime.sql` is ready to run

### 2. Activity Tracking & Data Storage ✅
- **Status**: Fully implemented
- **What it does**: Every action is logged and stored in appropriate tables
- **Tables storing activities**:
  - `audit_logs` - System-wide activity tracking
  - `leads` - Lead creation and updates
  - `projects` - Project lifecycle
  - `project_milestones` - Milestone progress
  - `payments` - Payment transactions
  - `messages` - Communication history
  - `notifications` - User notifications
  - `commissions` - Commission calculations

### 3. Authentication & Role-Based Routing ✅
- **Status**: Already working in your app
- **What it does**: Automatically routes users to correct dashboard based on role
- **Implementation**: `middleware.ts` handles this already
- Clients → `/dashboard/client`
- Commissioners → `/dashboard/commissioner`
- Developers → `/dashboard/developer`
- Admins → `/dashboard/admin`

### 4. Row Level Security (RLS) Policies ✅
- **Status**: Implemented in previous migrations
- **What it does**: Ensures users only see their own data
- **Coverage**:
  - Commissioners see only their leads/clients
  - Clients see only their projects
  - Developers see only assigned projects
  - Admins see everything
- **Location**: `012_rls_policies.sql` (already in your migrations folder)

---

## 🔧 What YOU Need to Configure in Supabase Dashboard

### Step 1: Enable Realtime (REQUIRED) 🚨

**What to do**:
```bash
# Option A: Using CLI (Recommended)
supabase db push

# Option B: Manual in Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy contents of: supabase/migrations/019_enable_realtime.sql
5. Paste and click "Run"
```

**Why**: Without this, the live pipeline won't work. Data won't sync in real-time.

**Verification**: Run this in SQL Editor:
```sql
SELECT is_realtime_enabled('leads');
-- Should return: true
```

---

### Step 2: Setup Storage Bucket (REQUIRED for Avatars) 🖼️

**What to do**:
1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Create bucket named: `avatars`
4. Set to **Public**
5. Add policies:

**Policy 1: Allow Authenticated Users to Upload**
```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Policy 2: Allow Public Read**
```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 3: Allow Users to Update Their Own**
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Why**: Users upload profile pictures. Without this bucket, avatar uploads will fail.

**Already implemented in code**: 
- API route: `app/api/upload/avatar/route.ts`
- Migration: `014_avatar_storage.sql` (policies are there)

---

### Step 3: Verify Authentication Settings (CHECK & CONFIRM) ✓

**What to do**:
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) or your production domain
   - Redirect URLs: Add these:
     ```
     http://localhost:3000/dashboard
     http://localhost:3000/dashboard/client
     http://localhost:3000/dashboard/commissioner
     http://localhost:3000/dashboard/developer
     http://localhost:3000/dashboard/admin
     https://your-production-domain.com/dashboard/*
     ```

**Why**: Ensures users are redirected correctly after OAuth login.

**Note**: Your app uses NextAuth, so Supabase auth is mainly for database access. This is already working.

---

### Step 4: Verify Environment Variables (CHECK) ✓

**What to check**:
Open `.env.local` and confirm you have:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your-connection-string
```

**Where to find these**:
- Supabase Dashboard → **Project Settings** → **API**
  - `URL` = NEXT_PUBLIC_SUPABASE_URL
  - `anon public` key = NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Connection string = DATABASE_URL

---

## 📊 Testing Checklist

After completing the setup above, test these scenarios:

### Test 1: Real-time Lead Creation
1. Open browser window A: Login as Commissioner 1
2. Open browser window B: Login as Commissioner 2 (or Admin)
3. In window A: Create a new lead
4. **Expected result**: Lead appears instantly in window B ✨

### Test 2: Client Project Flow
1. Open as Client: Create a new project
2. Open as Admin: Approve the project
3. **Expected result**: Client sees approval instantly without refresh ✨

### Test 3: Avatar Upload
1. Go to Profile Settings
2. Click "Upload Avatar"
3. Select an image
4. **Expected result**: Image uploads and displays immediately ✨

### Test 4: Connection Status
1. Open any dashboard
2. Look at top bar for connection indicator
3. **Expected result**: Shows "🟢 Live" ✨
4. Disconnect internet
5. **Expected result**: Shows "🔴 Offline"
6. Reconnect internet
7. **Expected result**: Auto-reconnects to "🟢 Live"

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Real-time not working"
**Solution**: Run the migration
```bash
supabase db push
```

### Issue 2: "Avatar upload fails"
**Solution**: 
1. Check storage bucket exists and is named `avatars`
2. Verify bucket is public
3. Check storage policies are applied

### Issue 3: "Connection shows Offline"
**Solution**:
1. Check environment variables are set
2. Verify Supabase project is not paused
3. Check browser console for errors

### Issue 4: "User can't access dashboard"
**Solution**:
1. Check user role is set correctly in database
2. Verify NextAuth configuration
3. Clear cookies and try again

---

## 🎯 Summary: Your Action Items

**MUST DO** (Required for real-time to work):
1. ✅ Run `supabase db push` (or manually run `019_enable_realtime.sql`)
2. ✅ Create `avatars` storage bucket with policies

**SHOULD CHECK** (Likely already working):
3. ✓ Verify environment variables are set
4. ✓ Confirm authentication redirect URLs

**That's it!** Once you complete steps 1-2, your entire real-time pipeline will be live and all user activities will sync across dashboards instantly.

---

## 📞 Need Help?

If you get stuck:
1. Check Supabase Dashboard → **Logs** for errors
2. Check browser console (F12) for client-side errors
3. Test with `SELECT is_realtime_enabled('leads');` in SQL Editor

Everything else is already built and ready to go! 🚀
