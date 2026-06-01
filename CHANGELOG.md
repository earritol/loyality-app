# Changelog — GANA (GanaMás Club)

## Sesión actual — Cambios pendientes de deploy

### Admin Dashboard (`/admin`)
- **Layout con sidebar** — `app/admin/layout.tsx` con verificación de platform admin + sidebar lateral
- **Sidebar** — `components/admin/admin-sidebar.tsx` con lucide-react icons (Dashboard, Negocios, Usuarios, Pagos, Canjes, Actividad)
- **Dashboard** — `app/admin/page.tsx` con métricas (negocios, usuarios, visitas, canjes, pagos) + sección de pagos pendientes
- **Negocios** — `app/admin/negocios/page.tsx` (movido desde `/admin`, CRUD de negocios)
- **Usuarios** — `app/admin/usuarios/page.tsx` (tabla con nombre/email/fecha)
- **Pagos** — `app/admin/pagos/page.tsx` (total recaudado + historial)
- **Canjes** — `app/admin/canjes/page.tsx` (top rewards + historial)
- **Actividad** — `app/admin/actividad/page.tsx` (negocios activos + últimas visitas)

### Lógica de pagos pendientes
- `lib/actions/admin-dashboard.ts` — Calcula pagos pendientes basándose en:
  - Si hoy >= día de pago del mes actual → revisa si `last_payment_date` cubre ese deadline
  - Si hoy < día de pago → revisa el deadline del mes anterior
  - Si `last_payment_date` es anterior al deadline más reciente → pendiente

### Owner en form de edición
- `lib/actions/backoffice.ts`:
  - `getAllBusinesses` ahora trae el email del owner via join
  - `updateBusinessOwner` — nuevo action para cambiar dueño
- `components/backoffice/edit-business-form.tsx` — campo "Dueño (email)" con botón separado
- `app/admin/negocios/page.tsx` — muestra email del dueño en el listado

### Healthcheck (keep-alive para Supabase)
- `app/api/health/route.ts` — endpoint que hace query simple a Supabase
- `vercel.json` — cron cada 5 días a las 8am UTC

### Fixes de UI/CSS
- `app/globals.css`:
  - Dark mode `--card` cambiado a `#1F2937` (mismo que navbar)
  - Dark mode `--background` = `#111827`
  - Dark mode `--border` = `#374151`
  - Dark mode `--input` = `#111827`
  - `input { background-color: var(--theme-input-bg) !important }` para forzar fondo oscuro en inputs
- `components/ui/card.tsx` — agregado `px-4` al className base
- `app/[slug]/admin/admin-panel.tsx` — agregado `px-4` a Cards
- `app/(protected)/inicio/page.tsx` — cambiado `space-y-4` a `flex flex-col gap-4` para separación de cards
- Etiqueta "Día de corte" → "Día de pago" en edit form

---

## Estado actual del proyecto

### Rutas principales
- `/` — Landing page
- `/entrar` — Login (email OTP)
- `/verificar` — Verificar código OTP
- `/inicio` — Dashboard del usuario (QR + visitas)
- `/local/[slug]` — Detalle de negocio (rewards + canje)
- `/perfil` — Perfil del usuario
- `/[slug]/admin` — Panel del negocio (owner/staff)
- `/[slug]/admin/registrar` — Registrar visita (QR + búsqueda)
- `/[slug]/admin/premios` — Gestión de rewards
- `/[slug]/admin/configurar` — Configuración del negocio
- `/[slug]/admin/suscripcion` — Suscripción/pagos del negocio
- `/admin` — Backoffice (platform admin)
- `/admin/negocios` — CRUD negocios
- `/admin/usuarios` — Lista usuarios
- `/admin/pagos` — Historial pagos
- `/admin/canjes` — Historial canjes
- `/admin/actividad` — Log de visitas

### Tech stack
- Next.js 16 (App Router, `proxy.ts` en vez de `middleware.ts`)
- Supabase (Auth OTP, PostgreSQL, Storage, RLS)
- Tailwind v4 + shadcn/ui (base-nova style)
- html5-qrcode + qrcode.react para QR
- Vercel deploy

### Temas pendientes
- Los inputs en dark mode deben tener fondo `#111827` (se forzó con `!important`)
- Las cards usan `bg-card` de shadcn que ahora es `#1F2937`
- El admin usa componentes de shadcn (Table, Card, Badge) con lucide-react
- Las páginas del usuario usan componentes custom (`bg-gana-*`)

### Base de datos (migraciones)
1. `001_schema.sql` — Tablas base (users, businesses, locations, visits, rewards, redemptions, tickets)
2. `002_add_indexes.sql` — Index visits_user_id + unique email
3. `003_business_admins.sql` — business_admins, slug, RLS updates
4. `004_user_name_fields.sql` — first_name, last_name en users
5. `005_rewards_admin_rls.sql` — RLS para rewards
6. `006_business_logo.sql` — logo_url en businesses
7. `007_redemption_flow.sql` — Flujo de canjes con visits_used
8. `008_business_rules_team.sql` — Rules, terms, team roles, PG function
9. `009_backoffice_billing.sql` — Status, payments, platform admin
10. `010_mercadopago.sql` — Subscription columns
11. `011_business_price.sql` — monthly_price, online payment method
