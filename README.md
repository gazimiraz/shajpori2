# Shajpori — Full-Stack E-Commerce

Bangladesh's favourite women's fashion platform. Built with Next.js 14, Supabase, Stripe & Framer Motion.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout |
| State | Zustand (cart) + TanStack Query |
| Types | TypeScript |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/route.ts          # GET/POST products
│   │   ├── orders/route.ts            # GET/POST orders
│   │   ├── checkout/route.ts          # Stripe checkout session
│   │   ├── webhook/route.ts           # Stripe webhook handler
│   │   └── admin/
│   │       ├── reports/route.ts       # All analytics & reports
│   │       ├── inventory/route.ts     # Stock management
│   │       └── finance/route.ts       # Finance ledger & P&L
│   ├── (store)/
│   │   ├── page.tsx                   # Homepage
│   │   ├── products/page.tsx          # Product listing
│   │   └── products/[slug]/page.tsx   # Product detail
│   ├── (admin)/admin/
│   │   ├── layout.tsx                 # Admin sidebar layout
│   │   ├── dashboard/page.tsx         # Dashboard
│   │   ├── orders/page.tsx            # Order management
│   │   ├── inventory/page.tsx         # Stock management
│   │   ├── finance/page.tsx           # Finance & P&L
│   │   └── reports/page.tsx           # Analytics
│   ├── auth/page.tsx                  # Login / Signup
│   └── layout.tsx                     # Root layout
├── components/
│   ├── ui/AnimatedComponents.tsx      # All Framer Motion components
│   ├── layout/Navbar.tsx              # Sticky nav with cart
│   └── store/
│       ├── CartSidebar.tsx            # Slide-out cart
│       └── ProductCard.tsx            # Product card
├── store/cartStore.ts                 # Zustand cart + persist
├── lib/supabase.ts                    # Supabase client helpers
└── types/index.ts                     # All TypeScript types
supabase/migrations/
├── 001_initial_schema.sql             # Complete schema + RLS + triggers
└── 002_seed_data.sql                  # 6 products + 31 variants + orders
```

---

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/you/shajpori.git
cd shajpori
npm install
```

### 2. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Copy your `Project URL` and `anon key`

### 3. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in your actual keys
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Migrations
In your Supabase SQL Editor, run both migration files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`

### 5. Stripe Setup
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook
# Copy the webhook secret to STRIPE_WEBHOOK_SECRET
```

### 6. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin/dashboard
```

---

## Key Features

### Store
- Animated bento grid homepage
- Product listing with filter by category / size / price
- Product detail page with image gallery, size + color selector
- Persistent cart with Zustand (survives page refresh)
- Stripe Checkout integration
- Supabase Auth (email + Google OAuth)

### Admin Dashboard
- Real-time sales metrics & charts
- Order management (status updates, filtering)
- Inventory management (per-variant stock, adjustments)
- Purchase orders (supplier restocking)
- Finance ledger (revenue, expenses, P&L)
- Reports: size-wise, color-wise, style-wise, product performance

### Database
- Full audit trail via `stock_movements` table
- Auto-generated order numbers (`SJP-YYYY-NNNNN`)
- Automatic stock deduction on order confirm (DB trigger)
- Automatic finance ledger entries (DB trigger)
- Row Level Security on all sensitive tables

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create product (admin) |
| GET | `/api/orders` | List orders (admin) |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id` | Update order status |
| POST | `/api/checkout` | Create Stripe session |
| POST | `/api/webhook` | Stripe webhook handler |
| GET | `/api/admin/reports?type=dashboard` | Dashboard stats |
| GET | `/api/admin/reports?type=size_wise` | Size analytics |
| GET | `/api/admin/reports?type=color_wise` | Color analytics |
| GET | `/api/admin/reports?type=product_performance` | Product P&L |
| GET | `/api/admin/inventory?type=variants` | All stock variants |
| POST | `/api/admin/inventory` | Stock adjustment / PO |
| GET | `/api/admin/finance?type=pnl` | Profit & Loss |
| POST | `/api/admin/finance` | Add ledger entry |

---

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Set all env vars in Vercel dashboard
# Update NEXT_PUBLIC_APP_URL to your production URL
# Update Stripe webhook endpoint in Stripe dashboard
```
