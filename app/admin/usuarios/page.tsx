import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()

  const { data: users, count } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">{count ?? 0} usuarios registrados</p>
      </div>

      {(users ?? []).length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Users className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Aún no hay usuarios registrados.</p>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users ?? []).map((user) => {
                const name = user.first_name || user.last_name
                  ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                  : '—'
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
