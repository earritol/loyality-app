import { getAdminMetrics } from '@/lib/actions/admin-dashboard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Store, Users, Eye, Gift, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics()

  if (!metrics) {
    return <p className="text-muted-foreground">Error al cargar métricas.</p>
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen de la plataforma</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<Store className="h-4 w-4" />} label="Negocios" value={metrics.totalBusinesses} sub={`${metrics.activeBusinesses} activos`} />
        <MetricCard icon={<Users className="h-4 w-4" />} label="Usuarios" value={metrics.totalUsers} />
        <MetricCard icon={<Eye className="h-4 w-4" />} label="Visitas hoy" value={metrics.visitsToday} />
        <MetricCard icon={<Eye className="h-4 w-4" />} label="Visitas este mes" value={metrics.visitsThisMonth} />
        <MetricCard icon={<Eye className="h-4 w-4" />} label="Visitas esta semana" value={metrics.visitsThisWeek} />
        <MetricCard icon={<Gift className="h-4 w-4" />} label="Canjes este mes" value={metrics.redemptionsThisMonth} />
        <MetricCard icon={<CreditCard className="h-4 w-4" />} label="Pagos este mes" value={metrics.paymentsThisMonth} />
        <MetricCard icon={<AlertTriangle className="h-4 w-4" />} label="Suspendidos" value={metrics.suspendedBusinesses} variant="destructive" />
      </div>

      {/* Pending payments */}
      <div>
        <h2 className="text-lg font-semibold">
          Pagos pendientes ({metrics.pendingPayments.length})
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Negocios cuya fecha de pago ya pasó y no tienen pago registrado este mes.
        </p>

        {metrics.pendingPayments.length === 0 ? (
          <Card className="mt-4 text-center py-8 px-4">
            <p className="text-muted-foreground">✅ Todos los negocios están al corriente.</p>
          </Card>
        ) : (
          <div className="mt-4 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Día de pago</TableHead>
                  <TableHead>Último pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.pendingPayments.map((biz) => (
                  <TableRow key={biz.id}>
                    <TableCell className="font-medium">{biz.name}</TableCell>
                    <TableCell>Día {biz.billing_cutoff_day}</TableCell>
                    <TableCell>
                      {biz.last_payment_date
                        ? new Date(biz.last_payment_date + 'T00:00:00').toLocaleDateString('es-MX')
                        : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="pending">${biz.monthly_price}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href="/admin/negocios" className="text-xs text-primary hover:underline">
                        Registrar →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  variant = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub?: string
  variant?: 'default' | 'destructive'
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-2xl font-bold mt-1 ${variant === 'destructive' ? 'text-destructive' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  )
}
