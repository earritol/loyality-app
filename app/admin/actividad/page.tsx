import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, TrendingUp } from 'lucide-react'

export default async function AdminActividadPage() {
  const supabase = await createClient()

  const { data: visits } = await supabase
    .from('visits')
    .select('id, method, created_at, users(email, first_name, last_name), businesses(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Top businesses
  const bizCounts = new Map<string, { name: string; count: number }>()
  for (const v of visits ?? []) {
    const biz = v.businesses as unknown as { name: string } | null
    if (biz) {
      const existing = bizCounts.get(biz.name)
      if (existing) existing.count++
      else bizCounts.set(biz.name, { name: biz.name, count: 1 })
    }
  }
  const topBiz = Array.from(bizCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Actividad</h1>
        <p className="text-sm text-muted-foreground mt-1">Visitas recientes y tendencias</p>
      </div>

      {topBiz.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Negocios más activos (últimas 50 visitas)</span>
          </div>
          <div className="space-y-2">
            {topBiz.map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <span className="text-sm">{b.name}</span>
                <Badge variant="visits">{b.count} visitas</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold">Últimas visitas</h2>

        {(visits ?? []).length === 0 ? (
          <Card className="mt-4 py-12 px-4 text-center">
            <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Aún no hay visitas registradas.</p>
          </Card>
        ) : (
          <div className="mt-4 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(visits ?? []).map((v) => {
                  const user = v.users as unknown as { email: string; first_name: string | null; last_name: string | null } | null
                  const biz = v.businesses as unknown as { name: string } | null
                  const userName = user?.first_name
                    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                    : user?.email ?? '—'

                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{userName}</TableCell>
                      <TableCell>{biz?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={v.method === 'qr' ? 'visits' : 'pending'}>
                          {v.method === 'qr' ? 'QR' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(v.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
