# Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Name | Value source |
|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) (optional) |

Do **not** add `SUPABASE_SERVICE_ROLE_KEY` unless you add server-only admin routes.
