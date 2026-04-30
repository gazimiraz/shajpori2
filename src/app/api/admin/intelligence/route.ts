// src/app/api/admin/intelligence/route.ts
// Sales intelligence engine: velocity, restock forecasts, time patterns, seasonal analysis
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'alerts'

  switch (type) {

    // ── COMPLETE ALERT SYSTEM ──────────────────────────────────────────
    case 'alerts': {
      const [stockAlerts, orders, products, movements] = await Promise.all([
        supabaseAdmin.from('v_stock_alerts').select('*'),
        supabaseAdmin.from('orders').select('status, payment_status, total_amount, created_at, order_number').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabaseAdmin.from('products').select('id, name, sku, total_sold, total_stock, low_stock_alert, price, cost_price, view_count, is_active').eq('is_active', true),
        supabaseAdmin.from('stock_movements').select('product_id, quantity, movement_type, created_at').gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      ])

      const alerts: Array<{
        id: string; severity: 'critical' | 'warning' | 'info' | 'success'
        type: string; title: string; description: string; action?: string
        product_id?: string; sku?: string
      }> = []

      // --- Stock alerts ---
      for (const s of (stockAlerts.data || [])) {
        if (s.stock_status === 'out_of_stock') {
          alerts.push({
            id: `oos-${s.id}`, severity: 'critical', type: 'stock',
            title: `OUT OF STOCK — ${s.sku}`,
            description: `${s.name} has 0 units. Immediate restock required. Check for pending orders and notify customers.`,
            action: 'Place purchase order now',
            product_id: s.id, sku: s.sku,
          })
        } else if (s.stock_status === 'low_stock') {
          // Calculate velocity from movements
          const productMovements = (movements.data || []).filter(m => m.product_id === s.id && m.movement_type === 'sale')
          const unitsSold = productMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
          const weeklySales = unitsSold / 4.3 // 30 days / 7
          const daysLeft = weeklySales > 0 ? Math.round(s.available_stock / (weeklySales / 7)) : 999

          alerts.push({
            id: `low-${s.id}`, severity: daysLeft <= 5 ? 'critical' : 'warning', type: 'stock',
            title: `LOW STOCK — ${s.name} (${s.available_stock} units, ~${daysLeft} days remaining)`,
            description: `Selling at ${weeklySales.toFixed(1)} units/week. ${daysLeft <= 5 ? 'URGENT: ' : ''}Reorder point reached. Recommend ordering ${Math.max(20, Math.round(weeklySales * 4))} units to cover 4 weeks.`,
            action: daysLeft <= 5 ? 'Order today' : 'Order within 3 days',
            product_id: s.id, sku: s.sku,
          })
        }
      }

      // --- Unpaid orders ---
      const unpaid = (orders.data || []).filter(o => o.payment_status === 'Unpaid' && o.status === 'Pending')
      for (const o of unpaid) {
        const ageHours = Math.round((Date.now() - new Date(o.created_at).getTime()) / 3600000)
        alerts.push({
          id: `unpaid-${o.order_number}`, severity: ageHours > 24 ? 'critical' : 'warning', type: 'payment',
          title: `UNPAID ORDER — ${o.order_number} (৳${o.total_amount.toLocaleString()}) — ${ageHours}h outstanding`,
          description: `Cash on delivery order awaiting payment. ${ageHours > 24 ? 'Auto-cancel policy triggers at 48h. ' : ''}Follow up with customer immediately.`,
          action: 'Call customer',
        })
      }

      // --- Slow movers (no sales in 30 days) ---
      const prods = products.data || []
      const soldIds = new Set((movements.data || []).filter(m => m.movement_type === 'sale').map(m => m.product_id))
      for (const p of prods) {
        if (!soldIds.has(p.id) && p.total_stock > 10) {
          alerts.push({
            id: `slow-${p.id}`, severity: 'warning', type: 'slow_mover',
            title: `SLOW MOVER — ${p.name} (${p.total_stock} units, zero sales in 30 days)`,
            description: `No sales recorded in the last 30 days. Consider a 10–15% promotional discount, bundle with a fast seller, or feature on homepage to clear stock.`,
            action: 'Run promotion',
            product_id: p.id, sku: p.sku,
          })
        }
      }

      // --- High margin opportunity ---
      for (const p of prods) {
        if (p.cost_price && p.price) {
          const margin = Math.round((1 - p.cost_price / p.price) * 100)
          if (margin >= 65 && p.total_stock > 20) {
            alerts.push({
              id: `margin-${p.id}`, severity: 'success', type: 'opportunity',
              title: `HIGH MARGIN PRODUCT — ${p.name} (${margin}% gross margin, ${p.total_stock} in stock)`,
              description: `This is your most profitable SKU. Increase marketing spend, add to featured section, and consider bundling to drive volume. Every unit sold generates ৳${Math.round(p.price - p.cost_price)} profit.`,
              action: 'Increase marketing',
              product_id: p.id,
            })
          }
        }
      }

      // Sort: critical first, then warning, info, success
      const ORDER = { critical: 0, warning: 1, info: 2, success: 3 }
      alerts.sort((a, b) => ORDER[a.severity] - ORDER[b.severity])

      return NextResponse.json({ data: alerts, counts: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning:  alerts.filter(a => a.severity === 'warning').length,
        info:     alerts.filter(a => a.severity === 'info').length,
        success:  alerts.filter(a => a.severity === 'success').length,
      }})
    }

    // ── SALES VELOCITY PER PRODUCT ────────────────────────────────────
    case 'velocity': {
      const { data: movements } = await supabaseAdmin
        .from('stock_movements')
        .select('product_id, variant_id, quantity, created_at, product:products(name, sku, total_stock, low_stock_alert)')
        .eq('movement_type', 'sale')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

      const velocityMap: Record<string, { name: string; sku: string; stock: number; threshold: number; units_sold_30d: number; daily_rate: number; days_left: number }> = {}

      for (const m of (movements || [])) {
        const pid = m.product_id
        if (!velocityMap[pid]) {
          const p = Array.isArray(m.product) ? m.product[0] : m.product
          velocityMap[pid] = { name: p?.name || '', sku: p?.sku || '', stock: p?.total_stock || 0, threshold: p?.low_stock_alert || 5, units_sold_30d: 0, daily_rate: 0, days_left: 0 }
        }
        velocityMap[pid].units_sold_30d += Math.abs(m.quantity)
      }

      for (const v of Object.values(velocityMap)) {
        v.daily_rate = Math.round((v.units_sold_30d / 30) * 100) / 100
        v.days_left = v.daily_rate > 0 ? Math.round(v.stock / v.daily_rate) : 999
      }

      return NextResponse.json({ data: Object.values(velocityMap).sort((a, b) => a.days_left - b.days_left) })
    }

    // ── TIME-OF-DAY PATTERN ───────────────────────────────────────────
    case 'hourly': {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())
        .not('status', 'eq', 'Cancelled')

      const hourCounts = new Array(24).fill(0)
      for (const o of (orders || [])) {
        const hour = new Date(o.created_at).getHours()
        hourCounts[hour]++
      }

      const total = hourCounts.reduce((s, c) => s + c, 0) || 1
      return NextResponse.json({
        data: hourCounts.map((count, hour) => ({
          hour, count, pct: Math.round(count / total * 1000) / 10,
          label: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        })),
        peak_hour: hourCounts.indexOf(Math.max(...hourCounts)),
        quiet_hours: hourCounts.map((c, h) => ({ h, c })).filter(x => x.c === 0).map(x => x.h),
      })
    }

    // ── DAY-OF-WEEK PATTERN ───────────────────────────────────────────
    case 'daily': {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString())
        .not('status', 'eq', 'Cancelled')

      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayCounts = new Array(7).fill(0)
      for (const o of (orders || [])) {
        dayCounts[new Date(o.created_at).getDay()]++
      }
      const total = dayCounts.reduce((s, c) => s + c, 0) || 1
      return NextResponse.json({
        data: DAYS.map((name, i) => ({ day: name, count: dayCounts[i], pct: Math.round(dayCounts[i] / total * 1000) / 10 })),
        peak_day: DAYS[dayCounts.indexOf(Math.max(...dayCounts))],
      })
    }

    // ── MONTHLY SALES BY PRODUCT ──────────────────────────────────────
    case 'monthly_products': {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('items_ordered, created_at')
        .not('status', 'eq', 'Cancelled')
        .gte('created_at', new Date(Date.now() - 365 * 86400000).toISOString())

      const monthProductMap: Record<string, Record<string, number>> = {}

      for (const order of (orders || [])) {
        const month = new Date(order.created_at).toISOString().slice(0, 7) // YYYY-MM
        if (!monthProductMap[month]) monthProductMap[month] = {}
        const items = Array.isArray(order.items_ordered) ? order.items_ordered : []
        for (const item of items) {
          const key = item.name || 'Unknown'
          monthProductMap[month][key] = (monthProductMap[month][key] || 0) + (item.qty || 1)
        }
      }

      return NextResponse.json({ data: monthProductMap })
    }

    // ── RESTOCK FORECAST ─────────────────────────────────────────────
    case 'restock_forecast': {
      const { data: variants } = await supabaseAdmin
        .from('product_variants')
        .select('id, sku, size, color, stock_quantity, product_id, product:products(name, sku, cost_price, low_stock_alert)')
        .eq('is_active', true)
        .order('stock_quantity')

      const { data: recentSales } = await supabaseAdmin
        .from('stock_movements')
        .select('variant_id, quantity')
        .eq('movement_type', 'sale')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

      const salesByVariant: Record<string, number> = {}
      for (const s of (recentSales || [])) {
        salesByVariant[s.variant_id] = (salesByVariant[s.variant_id] || 0) + Math.abs(s.quantity)
      }

      const forecasts = (variants || []).map(v => {
        const sold30d = salesByVariant[v.id] || 0
        const dailyRate = sold30d / 30
        const daysLeft = dailyRate > 0 ? Math.round(v.stock_quantity / dailyRate) : 999
        const reorderQty = Math.max(10, Math.round(dailyRate * 45)) // 45 day supply
        const p = Array.isArray(v.product) ? v.product[0] : v.product
        const estimatedCost = reorderQty * (p?.cost_price || 0)
        return {
          variant_id: v.id, sku: v.sku, product_name: p?.name || '', size: v.size, color: v.color,
          stock: v.stock_quantity, sold_30d: sold30d, daily_rate: Math.round(dailyRate * 100) / 100,
          days_left: daysLeft, reorder_qty: reorderQty, estimated_cost: estimatedCost,
          priority: daysLeft === 0 ? 'critical' : daysLeft <= 7 ? 'high' : daysLeft <= 21 ? 'medium' : 'low',
        }
      })

      return NextResponse.json({
        data: forecasts.sort((a, b) => a.days_left - b.days_left),
        summary: {
          critical: forecasts.filter(f => f.priority === 'critical').length,
          high:     forecasts.filter(f => f.priority === 'high').length,
          medium:   forecasts.filter(f => f.priority === 'medium').length,
          low:      forecasts.filter(f => f.priority === 'low').length,
          total_restock_cost: Math.round(forecasts.filter(f => f.priority !== 'low').reduce((s, f) => s + f.estimated_cost, 0)),
        }
      })
    }

    // ── BESTSELLER RANKING ────────────────────────────────────────────
    case 'bestsellers': {
      const period = parseInt(searchParams.get('days') || '30')
      const { data: movements } = await supabaseAdmin
        .from('stock_movements')
        .select('product_id, quantity, product:products(name, sku, category, price, cost_price)')
        .eq('movement_type', 'sale')
        .gte('created_at', new Date(Date.now() - period * 86400000).toISOString())

      const rankMap: Record<string, { name: string; sku: string; category: string; price: number; cost_price: number; units_sold: number; revenue: number; profit: number }> = {}

      for (const m of (movements || [])) {
        const pid = m.product_id
        if (!rankMap[pid]) {
          const p = Array.isArray(m.product) ? m.product[0] : m.product
          rankMap[pid] = { name: p?.name || '', sku: p?.sku || '', category: p?.category || '', price: p?.price || 0, cost_price: p?.cost_price || 0, units_sold: 0, revenue: 0, profit: 0 }
        }
        const qty = Math.abs(m.quantity)
        rankMap[pid].units_sold += qty
        rankMap[pid].revenue += qty * rankMap[pid].price
        rankMap[pid].profit += qty * (rankMap[pid].price - rankMap[pid].cost_price)
      }

      const ranked = Object.values(rankMap)
        .map(r => ({ ...r, margin: r.revenue > 0 ? Math.round((r.profit / r.revenue) * 100) : 0 }))
        .sort((a, b) => b.revenue - a.revenue)

      return NextResponse.json({ data: ranked, period_days: period })
    }

    // ── SIZE-WISE RANKING ─────────────────────────────────────────────
    case 'size_ranking': {
      const { data } = await supabaseAdmin
        .from('v_size_wise_sales')
        .select('*')

      const sizeTotal: Record<string, number> = {}
      for (const row of (data || [])) {
        sizeTotal[row.size] = (sizeTotal[row.size] || 0) + (row.total_sold || 0)
      }
      const grandTotal = Object.values(sizeTotal).reduce((s, v) => s + v, 0) || 1

      return NextResponse.json({
        data: Object.entries(sizeTotal)
          .map(([size, sold]) => ({ size, sold, pct: Math.round(sold / grandTotal * 1000) / 10 }))
          .sort((a, b) => b.sold - a.sold),
        raw: data,
      })
    }

    default:
      return NextResponse.json({ error: 'Unknown intelligence type' }, { status: 400 })
  }
}
