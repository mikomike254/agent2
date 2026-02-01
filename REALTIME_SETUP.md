# Quick Start: Supabase Realtime Setup

## 🚀 To Enable Real-time Features

### 1. Run the Database Migration

You need to enable Realtime on your Supabase tables. **Choose one option**:

**Option A: Using Supabase CLI** (Recommended)
```bash
# Navigate to your project directory
cd C:\Users\user\OneDrive\Desktop\agency

# Push the migration to your Supabase project
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/019_enable_realtime.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**

### 2. Verify It's Working

1. Open your app in two different browser windows
2. Log in as different users (e.g., two commissioners)
3. Create a lead in one window
4. Watch it appear instantly in the other window!

### 3. Connection Status

Look for the connection indicator in the top bar:
- 🟢 **Live** = Real-time is working
- 🟡 **Reconnecting** = Temporarily disconnected
- 🔴 **Offline** = No connection

---

## 📖 What's New

All dashboards now update in real-time without page refresh:

### Commissioner Dashboard
- New leads appear instantly
- Project status updates live
- Commission earnings update in real-time

### Client Dashboard  
- Milestone progress updates instantly
- Project status changes live
- Payment confirmations appear immediately

### Admin Dashboard
- New user registrations appear instantly
- Payment verifications update live
- Platform activity monitoring in real-time

---

## 🔍 Troubleshooting

**If real-time isn't working:**

1. **Check migration ran successfully**
   - Run: `SELECT is_realtime_enabled('leads');` in Supabase SQL Editor
   - Should return `true`

2. **Check connection status**
   - Look at the status indicator in top bar
   - Should show "Live" when connected

3. **Check console for errors**
   - Open browser DevTools (F12)
   - Look for Supabase connection errors

4. **Verify environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL` must be set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set

---

## 📄 Full Documentation

See [walkthrough.md](file:///C:/Users/user/.gemini/antigravity/brain/e5753faa-de34-4a0a-ad0f-bdc9c16d74ab/walkthrough.md) for complete implementation details.
