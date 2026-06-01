import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').select('id').limit(1)

  return Response.json({
    status: error ? 'error' : 'ok',
    timestamp: new Date().toISOString(),
  })
}
