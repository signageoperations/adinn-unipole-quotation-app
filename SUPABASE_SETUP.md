# Supabase Permanent Storage Setup

## 1. Create Supabase project
Create a Supabase project, then open **SQL Editor** and run the full contents of `supabase-schema.sql`.

## 2. Get environment values
Open **Project Settings > API** and copy:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Do not use the service role key in the frontend.

## 3. Local development
Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server:

```bash
npm run dev
```

The header should show: `Supabase permanent database`.

## 4. Vercel deployment
In Vercel project settings, add the same two Environment Variables:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Redeploy after adding them.

## 5. Notes
Quotation records are stored in the `quotations` table. The app still keeps a local browser cache, but Supabase becomes the permanent source when the environment variables are configured.
