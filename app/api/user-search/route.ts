import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return Response.json({ users: [] })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ users: [] }, { status: 401 })

  // Search by email or phone (ILIKE for case-insensitive partial match)
  const pattern = `%${q}%`
  const { data } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone')
    .or(`email.ilike.${pattern},phone.ilike.${pattern}`)
    .limit(5)

  const users = (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : null,
    phone: u.phone,
  }))

  return Response.json({ users })
}
