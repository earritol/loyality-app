import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Gift, TrendingUp } from 'lucide-react'

export default async function AdminCanjesPage() {
  const supabase = await createClient()

  const { data: redemptions, count } = await supabase
    .from('redemptions')
    .select('id, visits_used, created_at, users(email, first_name, last_name), rewards(name), businesses(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  // Top rewards
  const rewardCounts = new Map<string, number>()
  for (const r of redemptions ?? []) {
    const reward = r.rewards as unknown as { name: string } | null
    if (reward) {
      rewardCounts.set(reward.name, (rewardCounts.get(reward.name) ?? 0) + 1)
    }
  }
  const topRewards = Array.from(rewardCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Canjes</h1>
        <p className="text-sm text-muted-foreground mt-1">{count ?? 0} canjes realizados</p>
      </div>

      {topRewards.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Recompensas más canjeadas</span>
          </div>
          <div className="space-y-2">
            {topRewards.map(([name, qty]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm">{name}</span>
                <Badge variant="visits">{qty} canjes</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(redemptions ?? []).length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Gift className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Aún no se han realizado canjes.</p>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recompensa</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(redemptions ?? []).map((r) => {
                const user = r.users as unknown as { email: string; first_name: string | null; last_name: string | null } | null
                const reward = r.rewards as unknown as { name: string } | null
                const biz = r.businesses as unknown as { name: string } | null
                const userName = user?.first_name
                  ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                  : user?.email ?? '—'

                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{reward?.name ?? '—'}</TableCell>
                    <TableCell>{userName}</TableCell>
                    <TableCell>{biz?.name ?? '—'}</TableCell>
                    <TableCell>{r.visits_used}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('es-MX')}
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
