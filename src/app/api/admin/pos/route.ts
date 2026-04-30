// src/app/api/admin/pos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'sales'
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '20')
  const from = (page - 1) * perPage

  switch (type) {
    case 'sales': {
      const date = searchParams.get('date')
      const sessionId = searchParams.get('session_id')

      let query = supabaseAdmin
        .from('pos_sales')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1)

      if (date) query = query.gte('created_at', date + 'T00:00:00').lte('created_at', date + 'T23:59:59')
      if (sessionId) query = query.eq('session_id', sessionId)

      const { data, error, count } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data, count })
    }

    case 'session': {
      // Get current open session
      const { data, error } = await supabaseAdmin
        .from('pos_sessions')
        .select('*')
        .eq('status', 'Open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'daily_summary': {
      const { data, error } = await supabaseAdmin
        .from('v_pos_daily_summary')
        .select('*')
        .limit(30)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'today': {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabaseAdmin
        .from('v_pos_daily_summary')
        .select('*')
        .eq('sale_date', today)
        .single()
      if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'products': {
      // Products available for POS (active, in stock)
      const search = searchParams.get('search') || ''
      const cat = searchParams.get('category') || ''
      const barcode = searchParams.get('barcode') || ''

      let query = supabaseAdmin
        .from('products')
        .select('id, name, sku, barcode, category, price, total_stock, thumbnail_url, available_sizes, colors')
        .eq('is_active', true)
        .gt('total_stock', 0)
        .order('name')

      if (search) query = query.ilike('name', `%${search}%`)
      if (cat) query = query.eq('category', cat)
      if (barcode) query = query.eq('barcode', barcode)

      const { data, error } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    default:
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  switch (action) {
    case 'create_sale': {
      const {
        session_id, cashier_id, customer_name, customer_phone,
        items, subtotal, discount_pct = 0, discount_amt = 0,
        delivery_charge = 0, tax_amount = 0, total_amount,
        payment_method = 'cash', amount_tendered, change_given, notes
      } = body

      // Validate items have enough stock
      for (const item of items) {
        if (item.variant_id) {
          const { data: variant } = await supabaseAdmin
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .single()
          if (!variant || variant.stock_quantity < item.qty) {
            return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 })
          }
        }
      }

      // Create POS sale
      const { data: sale, error } = await supabaseAdmin
        .from('pos_sales')
        .insert({
          session_id, cashier_id, customer_name, customer_phone,
          items, subtotal, discount_pct, discount_amt,
          delivery_charge, tax_amount, total_amount,
          payment_method, amount_tendered, change_given, notes
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      // Deduct stock for each item
      for (const item of items) {
        if (item.variant_id) {
          const { data: v } = await supabaseAdmin
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .single()

          if (v) {
            await supabaseAdmin
              .from('product_variants')
              .update({ stock_quantity: v.stock_quantity - item.qty })
              .eq('id', item.variant_id)

            await supabaseAdmin.from('stock_movements').insert({
              product_id: item.product_id,
              variant_id: item.variant_id,
              movement_type: 'sale',
              quantity: -item.qty,
              quantity_before: v.stock_quantity,
              quantity_after: v.stock_quantity - item.qty,
              reference_id: sale.id,
              reference_type: 'pos_sale',
            })
          }
        }

        // Update product total_sold
        await supabaseAdmin
          .from('products')
          .update({
            total_sold: supabaseAdmin.rpc('increment', { x: item.qty }),
            total_revenue: supabaseAdmin.rpc('increment_by', { x: item.total_price }),
          })
          .eq('id', item.product_id)
      }

      // Record in finance ledger
      await supabaseAdmin.from('finance_ledger').insert({
        entry_type: 'revenue',
        category: 'pos_sale',
        description: `POS Sale ${sale.sale_number}${customer_name ? ' - ' + customer_name : ''}`,
        amount: total_amount,
        reference_id: sale.id,
        reference_type: 'pos_sale',
        payment_method,
      })

      // Update session totals
      if (session_id) {
        await supabaseAdmin.rpc('increment_session_totals', {
          session_id,
          sale_amount: total_amount
        })
      }

      return NextResponse.json({ data: sale }, { status: 201 })
    }

    case 'open_session': {
      const { cashier_id, terminal_name = 'Main POS', opening_cash = 0 } = body
      const year = new Date().getFullYear()

      // Check if session already open
      const { data: existing } = await supabaseAdmin
        .from('pos_sessions')
        .select('id')
        .eq('status', 'Open')
        .single()

      if (existing) return NextResponse.json({ error: 'A session is already open' }, { status: 409 })

      const { count } = await supabaseAdmin
        .from('pos_sessions')
        .select('id', { count: 'exact' })
        .ilike('session_number', `POS-${year}-%`)

      const sessionNumber = `POS-${year}-${String((count || 0) + 1).padStart(4, '0')}`

      const { data, error } = await supabaseAdmin
        .from('pos_sessions')
        .insert({ session_number: sessionNumber, cashier_id, terminal_name, opening_cash })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data }, { status: 201 })
    }

    case 'close_session': {
      const { session_id, closing_cash } = body

      const { data: session } = await supabaseAdmin
        .from('pos_sessions')
        .select('total_sales, opening_cash')
        .eq('id', session_id)
        .single()

      const { data, error } = await supabaseAdmin
        .from('pos_sessions')
        .update({
          status: 'Closed',
          closed_at: new Date().toISOString(),
          closing_cash,
        })
        .eq('id', session_id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data, cash_difference: closing_cash - (session?.total_sales || 0) })
    }

    case 'return_sale': {
      const { sale_id, reason } = body

      const { data: sale } = await supabaseAdmin
        .from('pos_sales')
        .select('*')
        .eq('id', sale_id)
        .single()

      if (!sale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
      if (sale.is_returned) return NextResponse.json({ error: 'Already returned' }, { status: 409 })

      // Mark as returned
      await supabaseAdmin.from('pos_sales').update({ is_returned: true }).eq('id', sale_id)

      // Restore stock
      for (const item of sale.items) {
        if (item.variant_id) {
          const { data: v } = await supabaseAdmin
            .from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
          if (v) {
            await supabaseAdmin.from('product_variants')
              .update({ stock_quantity: v.stock_quantity + item.qty }).eq('id', item.variant_id)
            await supabaseAdmin.from('stock_movements').insert({
              product_id: item.product_id, variant_id: item.variant_id,
              movement_type: 'return', quantity: item.qty,
              quantity_before: v.stock_quantity, quantity_after: v.stock_quantity + item.qty,
              reference_id: sale_id, reference_type: 'pos_return', notes: reason,
            })
          }
        }
      }

      // Record refund in finance
      await supabaseAdmin.from('finance_ledger').insert({
        entry_type: 'refund', category: 'pos_return',
        description: `Return: POS Sale ${sale.sale_number} — ${reason || 'Customer return'}`,
        amount: sale.total_amount, reference_id: sale_id, reference_type: 'pos_return',
      })

      return NextResponse.json({ data: { returned: true, amount: sale.total_amount } })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
