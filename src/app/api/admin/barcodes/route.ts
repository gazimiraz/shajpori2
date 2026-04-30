// src/app/api/admin/barcodes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  generateEAN13, generateCode128, validateEAN13,
  generateVariantSKU, renderEAN13SVG, type LabelData
} from '@/lib/barcode'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'list'
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '30')
  const from = (page - 1) * perPage

  switch (type) {
    case 'list': {
      const cat = searchParams.get('category')
      const search = searchParams.get('search')

      let query = supabaseAdmin
        .from('barcodes')
        .select(`
          *,
          product:products(name, sku, category, price),
          variant:product_variants(size, color)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1)

      if (search) query = query.ilike('barcode_value', `%${search}%`)

      const { data, error, count } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data, count })
    }

    case 'scan': {
      // Look up a product by barcode scan
      const barcode = searchParams.get('barcode')
      if (!barcode) return NextResponse.json({ error: 'Barcode required' }, { status: 400 })

      // Check barcodes table first
      const { data: bcData } = await supabaseAdmin
        .from('barcodes')
        .select('*, product:products(*, variants:product_variants(*)), variant:product_variants(*)')
        .eq('barcode_value', barcode)
        .eq('is_active', true)
        .single()

      if (bcData) return NextResponse.json({ data: bcData, source: 'barcode_registry' })

      // Fallback: check product/variant barcode column
      const { data: prodData } = await supabaseAdmin
        .from('products')
        .select('*, variants:product_variants(*)')
        .or(`barcode.eq.${barcode}`)
        .single()

      if (prodData) return NextResponse.json({ data: prodData, source: 'product_column' })

      return NextResponse.json({ error: 'Product not found for this barcode' }, { status: 404 })
    }

    case 'print_log': {
      const { data, error } = await supabaseAdmin
        .from('barcode_print_log')
        .select('*, barcode:barcodes(barcode_value, product_id)')
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1)
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
    case 'generate': {
      // Generate one or more barcodes for product/variants
      const { product_id, variant_ids = [], barcode_type = 'EAN13', count = 1 } = body
      const generated: { barcode_value: string; product_id?: string; variant_id?: string }[] = []

      const generate = () => barcode_type === 'CODE128'
        ? generateCode128('SJP')
        : generateEAN13('880')

      if (variant_ids.length > 0) {
        for (const variant_id of variant_ids) {
          let barcode = generate()
          // Ensure uniqueness
          while (true) {
            const { data } = await supabaseAdmin
              .from('barcodes')
              .select('id')
              .eq('barcode_value', barcode)
              .single()
            if (!data) break
            barcode = generate()
          }
          generated.push({ barcode_value: barcode, product_id, variant_id })
        }
      } else {
        for (let i = 0; i < count; i++) {
          let barcode = generate()
          while (true) {
            const { data } = await supabaseAdmin
              .from('barcodes').select('id').eq('barcode_value', barcode).single()
            if (!data) break
            barcode = generate()
          }
          generated.push({ barcode_value: barcode, product_id })
        }
      }

      const inserts = generated.map(g => ({ ...g, barcode_type }))
      const { data, error } = await supabaseAdmin
        .from('barcodes')
        .insert(inserts)
        .select()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data, generated: generated.length }, { status: 201 })
    }

    case 'validate': {
      const { barcode, type = 'EAN13' } = body
      const isValid = type === 'EAN13' ? validateEAN13(barcode) : barcode.length > 0
      return NextResponse.json({ valid: isValid, barcode, type })
    }

    case 'assign': {
      // Assign an existing or new barcode to a product/variant
      const { product_id, variant_id, barcode_value, barcode_type = 'EAN13' } = body

      // Check if barcode already exists
      const { data: existing } = await supabaseAdmin
        .from('barcodes')
        .select('id')
        .eq('barcode_value', barcode_value)
        .single()

      if (existing) return NextResponse.json({ error: 'Barcode already in use' }, { status: 409 })

      const { data, error } = await supabaseAdmin
        .from('barcodes')
        .insert({ barcode_value, barcode_type, product_id, variant_id })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      // Also update the product/variant barcode column for quick lookup
      if (variant_id) {
        await supabaseAdmin.from('product_variants').update({ barcode: barcode_value }).eq('id', variant_id)
      } else if (product_id) {
        await supabaseAdmin.from('products').update({ barcode: barcode_value }).eq('id', product_id)
      }

      return NextResponse.json({ data }, { status: 201 })
    }

    case 'log_print': {
      const { barcode_id, copies = 1, label_size = '40mm × 25mm' } = body
      await supabaseAdmin.from('barcode_print_log').insert({ barcode_id, copies, label_size })
      await supabaseAdmin.from('barcodes')
        .update({ printed_count: supabaseAdmin.rpc('increment_print_count', { barcode_id }), last_printed: new Date().toISOString() })
        .eq('id', barcode_id)
      return NextResponse.json({ success: true })
    }

    case 'render_svg': {
      const { barcode_value, width = 200, height = 80, show_text = true } = body
      if (!validateEAN13(barcode_value)) {
        return NextResponse.json({ error: 'Invalid EAN-13 barcode' }, { status: 400 })
      }
      const svg = renderEAN13SVG(barcode_value, { width, height, showText: show_text })
      return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml' } })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
