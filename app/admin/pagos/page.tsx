import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, DollarSign } from 'lucide-react'

const methodLabels: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  online: 'En línea',
}

export default async function AdminPagosPage() {
  const supabase = await createClient()

  const { data: payments, count } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, notes, created_at, businesses(name)', { count: 'exact' })
    .order('payment_date', { ascending: false })
    .limit(100)

  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const totalThisMonth = (payments ?? [])
    .filter((p) => p.payment_date >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-sm text-muted-foreground mt-1">Historial de pagos de negocios</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Recaudado este mes</span>
          </div>
          <p className="text-2xl font-bold mt-1">${totalThisMonth.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Pagos totales</span>
          </div>
          <p className="text-2xl font-bold mt-1">{count ?? 0}</p>
        </Card>
      </div>

      {(payments ?? []).length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <CreditCard className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Aún no hay pagos registrados.</p>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Negocio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments ?? []).map((payment) => {
                const biz = payment.businesses as unknown as { name: string } | null
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{biz?.name ?? '—'}</TableCell>
                    <TableCell>{new Date(payment.payment_date + 'T00:00:00').toLocaleDateString('es-MX')}</TableCell>
                    <TableCell>
                      <Badge variant="visits">{methodLabels[payment.method] ?? payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.notes ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">${Number(payment.amount).toLocaleString()}</TableCell>
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
