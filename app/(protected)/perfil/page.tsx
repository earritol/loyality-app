import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ProfileForm } from '@/components/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name, last_name, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* replaced by Navbar — logo and back link removed */}

        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <h1 className="text-lg font-bold text-gana-text">Mi perfil</h1>
        </div>

        <Card className="mt-4">
          <ProfileForm
            email={profile?.email ?? user.email ?? ''}
            firstName={profile?.first_name ?? null}
            lastName={profile?.last_name ?? null}
            phone={profile?.phone ?? null}
          />
        </Card>
      </div>
    </div>
  )
}
