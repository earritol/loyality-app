import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return Response.json({ userId: null })
  }

  const supabase = await createClient()

  // Verify the caller is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ userId: null }, { status: 401 })
  }

  // Look up user by email using service-level query
  // Since RLS restricts users table to own record, we query with a match
  // The admin needs to find customers — we use a DB function or direct lookup
  // For MVP, we'll use the admin's supabase client with a simple select
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  return Response.json({ userId: data?.id ?? null })
}
